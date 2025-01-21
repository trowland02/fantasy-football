from dotenv import load_dotenv
import os
import boto3
import subprocess
import mysql.connector
import time

# ----------------------------------------------------------------------------------------------------------------------


def _list_backups():
    backup_ids = list()

    s3 = boto3.client('s3')  # Create an S3 client
    response = s3.list_objects_v2(
        Bucket=os.environ["BACKUP_S3_BUCKET"], Prefix=os.environ["BUCKET_PREFIX"])
    
    for obj in response['Contents']:
        item = obj['Key']
        if item.endswith("sql"):
            backup_ids.append(item.split("-")[-1].split("/")[0].split(".")[0])

    return backup_ids

# ----------------------------------------------------------------------------------------------------------------------


def _recent_restore():

    client = {
        'host': os.environ["MYSQL_URL"],
        'user': 'root',
        'password': os.environ["MYSQL_ROOT_PASSWORD"],
        'database': os.environ["DB_NAME"],
    }
    backups = _list_backups()
    print(backups)

    if len(backups) > 0:
        backupID = max(backups)
        try:
            # Download the SQL dump file from S3
            s3 = boto3.client('s3')
            restore_file_path = os.path.join('app', 'tempStore', 'backup.sql')  # Specify the local backup directory
            s3.download_file(os.environ["BACKUP_S3_BUCKET"], f"{os.environ['BUCKET_PREFIX']}sql-backup-{backupID}.sql", restore_file_path)
            with open(restore_file_path, 'rb') as sql_file:
                subprocess.run([
                'mysql',
                f"--host={client['host']}",
                f"--user={client['user']}",
                f"--password={client['password']}",
                client['database']], stdin=sql_file, text=True, check=True)
            response = f"Database restored {backupID} successfully."

        except Exception as e:
            response = f"Database restore failed: {str(e)}"

        # Clean up: Remove the downloaded SQL dump file
        finally:
            if os.path.exists(restore_file_path):
                os.remove(restore_file_path)

    else:
        _clear_database(client)
        response = "New Instance Created - No Backups"

    return response

# ----------------------------------------------------------------------------------------------------------------------

def _clear_database(client):
    try:
        # SQL statements to create tables
        create_user_table = """
        CREATE TABLE users (
            userID INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(60) UNIQUE NOT NULL,
            password VARCHAR(50) NOT NULL,
            first_name VARCHAR(30) NOT NULL,
            last_name VARCHAR(30) NOT NULL,
            ex_points INT NOT NULL DEFAULT 0,
            rem_budget INT DEFAULT 30000
        );
        """

        create_player_table = """
        CREATE TABLE players (
            playerID INT AUTO_INCREMENT PRIMARY KEY,
            first_name VARCHAR(30) NOT NULL,
            last_name VARCHAR(30) NOT NULL,
            cost INT NOT NULL,
            position VARCHAR(50),
            recorded_points INT NOT NULL DEFAULT 0, 
            new_points INT NOT NULL DEFAULT 0
        );
        """
        create_fantasy_table = """
        CREATE TABLE fantasy (
            userID INT NOT NULL,
            playerID INT NOT NULL,
            PRIMARY KEY (playerID, userID),
            FOREIGN KEY (playerID) REFERENCES players(playerID),
            FOREIGN KEY (userID) REFERENCES users(userID)
        );
        """

        create_captain_table = """
        CREATE TABLE captain (
            userID INT NOT NULL,
            playerID INT NOT NULL,
            PRIMARY KEY (userID),
            FOREIGN KEY (userID) REFERENCES users(userID)
        );
        """

        create_socials_table = """
        CREATE TABLE socials (
            socialID INT AUTO_INCREMENT PRIMARY KEY,
            location VARCHAR(50) NOT NULL,
            date DATE NOT NULL
        );
        """

        create_games_table = """
        CREATE TABLE games (
            gameID INT AUTO_INCREMENT PRIMARY KEY,
            location VARCHAR(50) NOT NULL,
            opponent VARCHAR(60) NOT NULL,
            opp VARCHAR(3) NOT NULL,
            we_scored INT NOT NULL DEFAULT 0, 
            they_scored INT NOT NULL DEFAULT 0,
            date DATE NOT NULL
        );
        """

        create_gpoints_table = """
        CREATE TABLE gpoints (
            playerID INT NOT NULL,
            gameID INT NOT NULL,
            pointID INT NOT NULL, 
            quant INT NOT NULL,
            PRIMARY KEY (playerID, gameID, pointID),
            FOREIGN KEY (playerID) REFERENCES players(playerID),
            FOREIGN KEY (gameID) REFERENCES games(gameID)
        );
        """

        create_spoints_table = """
        CREATE TABLE spoints (
            playerID INT NOT NULL,
            socialID INT NOT NULL,
            pointID INT NOT NULL, 
            quant INT NOT NULL,
            PRIMARY KEY (playerID, socialID, pointID),
            FOREIGN KEY (playerID) REFERENCES players(playerID),
            FOREIGN KEY (socialID) REFERENCES socials(socialID)
        );
        """

        connection = mysql.connector.connect(**client)
        cursor = connection.cursor()

        # Execute the CREATE TABLE queries
        cursor.execute(create_user_table)
        cursor.execute(create_player_table)

        cursor.execute(create_fantasy_table)
        cursor.execute(create_captain_table)

        cursor.execute(create_socials_table)
        cursor.execute(create_games_table)

        cursor.execute(create_gpoints_table)
        cursor.execute(create_spoints_table)

        # Commit the changes
        connection.commit()

        print("DATABASE CREATED SUCCESFULLY!")

    except Exception as e:
        print("Error:", str(e))

    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# ----------------------------------------------------------------------------------------------------------------------


def main():
    """
    Main app
    """
    print("Waiting for SQL db")

    # Sleep for 15 seconds
    time.sleep(15)
    load_dotenv()
    
    try:
        print(_recent_restore())
    except Exception as e:
        print(str(e))


if __name__ == '__main__':
    main()
