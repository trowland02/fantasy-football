import os
from dotenv import load_dotenv
import boto3
import pendulum
import mysql.connector
import subprocess
from datetime import datetime

class AdminClient:
    def _init_(self):
        load_dotenv()
        self.authorised = False

    # ----------------------------------------------------------------------------------------------------------------------

    def auth_user(self, api_key):
        response = False
        if api_key == os.environ["MYSQL_ROOT_PASSWORD"]:
            response = True
            self.authorised = True

        return response

    # ----------------------------------------------------------------------------------------------------------------------

    def check_auth(self):
        try:
            return self.authorised
        except:
            return False
    
    # ----------------------------------------------------------------------------------------------------------------------

    def add_player(self, fName, sName, baseCost, pos):

        query = f"""
        INSERT INTO players 
        (first_name, last_name, cost, position) 
        VALUES ('{fName}', '{sName}', '{baseCost}', '{pos}');
        """

        self._sql_cmd(query)

        return None
        
    # ----------------------------------------------------------------------------------------------------------------------

    def get_playerID(self, fName, sName, baseCost, pos):

        query = f"""
        SELECT playerID
        FROM players
        WHERE first_name = '{fName}' AND last_name = '{sName}' AND cost = '{baseCost}' AND position = '{pos}';
        """

        return self._sql_return(query)[0][0][0]
    
    # ----------------------------------------------------------------------------------------------------------------------

    def get_players(self):
        query = f"""
        SELECT p.playerID, p.first_name, p.last_name
        FROM players p
        ORDER BY p.first_name;
        """

        result = self._sql_return(query)[0]
        players = []
        for player in result:
            players.append([player[0], f"{player[1]} {player[2]}"])

        return players
    
    # ----------------------------------------------------------------------------------------------------------------------

    def delete_player(self, playerID):
        tables = ["players", "captain", "fantasy", "gpoints", "spoints"]
        queryList = []
        for table in tables:
            queryList.append(f"DELETE FROM {table} WHERE playerID = {playerID};")

        self._sql_cmd(queryList)

        return None
    
    # ----------------------------------------------------------------------------------------------------------------------

    def leaderboard_players(self):
        query = f"""
        SELECT p.playerID, p.first_name, p.last_name, p.recorded_points + p.new_points, p.cost, p.position
        FROM players p
        ORDER BY p.recorded_points + p.new_points DESC;
        """

        result = [list(item) for item in self._sql_return(query)[0]]
        sorted_leader =  sorted(result, key=lambda x: x[4], reverse=True)

        return result
        # Sorted playerID, first_name, last_name, cost, recorded_points**, position
    
    # ----------------------------------------------------------------------------------------------------------------------

    def leaderboard_users(self):
        query = f"""
        SELECT u.userID, u.first_name, u.last_name, u.points, u.rem_budget
        FROM users u
        """

        result = self._sql_return(query)[0]

        leaderboard = []
        
        for i in range(0, len(result)):
            leaderboard.append([result[i][0], f"{result[i][1]} {result[i][2]}", int(result[i][3]), int(result[i][4])])

        # Sort the array by score in ascending order
        sorted_leader =  sorted(leaderboard, key=lambda x: x[2], reverse=True)

        return sorted_leader
        # Sorted userID, (first_name last_name), points**
    
    # ----------------------------------------------------------------------------------------------------------------------

    def update_user(self, userID, points, rem_budget):

        query = f"""
        UPDATE users
        SET points = {points}, rem_budget = {rem_budget}
        WHERE userID = {userID};
        """

        self._sql_cmd(query)

        return None
    
    # ----------------------------------------------------------------------------------------------------------------------

    def update_player(self, playerID, cost, rec_points, position):
        
        query = f"""
        UPDATE players
        SET cost = {cost}, new_points = new_points + {rec_points}, position = '{position}'
        WHERE playerID = {playerID};
        """

        self._sql_cmd(query)

        return None

    # ----------------------------------------------------------------------------------------------------------------------

    def get_games(self):

        query = f"""
        SELECT gameID, opponent, opp, we_scored, they_scored, date
        FROM games
        ORDER BY date;
        """

        result = self._sql_return(query)[0]
        games = []
        for i in range(0, len(result)):
            games.append([result[i][0], result[i][1], result[i][5], f"RSM: {result[i][3]} - {result[i][2]}: {result[i][4]}"])

        return self._alphabetic_2darray(games, 1)
    
    # ----------------------------------------------------------------------------------------------------------------------

    def get_socials(self):
        query = f"""
        SELECT socialID, location, date
        FROM socials
        """

        result = [list(item) for item in self._sql_return(query)[0]]

        return self._alphabetic_2darray(result, 1)
    
    # ----------------------------------------------------------------------------------------------------------------------

    def game_overview(self, gameID):
        gameDetails = []
        eventsList = []

        exists = False   
        countQuery = f"""
        SELECT COUNT(*) AS game_count
        FROM games
        WHERE gameID = '{gameID}';
        """

        result = self._sql_return(countQuery)

        if result and result[0][0][0] > 0:
            exists = True   

            queryList = []

            queryTemp = f"""
            SELECT location, opponent, opp, we_scored, they_scored, date
            FROM games
            WHERE gameID = {gameID}
            """
            queryList.append(queryTemp)

            queryTemp = f"""
            SELECT player.first_name, player.last_name, gp.pointID, gp.quant
            FROM gpoints AS gp
            JOIN players AS player ON player.playerID = gp.playerID
            WHERE gp.gameID = {gameID};
            """
            queryList.append(queryTemp)

            returnDetails, gameEvents = self._sql_return(queryList)
            events = [list(item) for item in gameEvents]
            gameDetails = list(returnDetails[0])
            
            eventsList = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []]
            for item in events:
                eventsList[item[2] - 1].append([f"{item[0]} {item[1]}", item[3]])

        return exists, gameDetails, eventsList
    
    # ----------------------------------------------------------------------------------------------------------------------

    def social_overview(self, socialID):
        socialDetails = []
        eventsList = []
        
        exists = False   
        countQuery = f"""
        SELECT COUNT(*) AS social_count
        FROM socials
        WHERE socialID = '{socialID}';
        """

        result = self._sql_return(countQuery)

        if result and result[0][0][0] > 0:
            exists = True   

            queryList = []

            queryTemp = f"""
            SELECT location, date
            FROM socials
            WHERE socialID = {socialID}
            """
            queryList.append(queryTemp)

            queryTemp = f"""
            SELECT player.first_name, player.last_name, sp.pointID, sp.quant
            FROM spoints AS sp
            JOIN players AS player ON player.playerID = sp.playerID
            WHERE sp.socialID = {socialID};
            """
            queryList.append(queryTemp)

            returnDetails, socialEvents = self._sql_return(queryList)
            socialDetails = list(returnDetails[0])
            events = [list(item) for item in socialEvents]
            
            eventsList = [[], [], [], [], [], [], []]
            for item in events:
                eventsList[item[2] - 1].append([f"{item[0]} {item[1]}", item[3]])

        return exists, socialDetails, eventsList

    # ----------------------------------------------------------------------------------------------------------------------

    def add_game(self, game_details, eventList):
        #1: HOME/AWAY, 2: Opponent, 3: Opp, date, we_score, they_scored
        print("add game")
        query = f"""
        INSERT INTO games (location, opponent, opp, we_scored, they_scored, date) 
        VALUES ('{game_details[0]}', '{game_details[1]}', '{game_details[2]}', {game_details[3]}, {game_details[4]}, '{game_details[5]}');
        """
        self._sql_cmd(query)
        print("here1")

        query = f"""
        SELECT gameID
        FROM games
        WHERE
            location = '{game_details[0]}'
            AND opponent = '{game_details[1]}'
            AND opp = '{game_details[2]}'
            AND we_scored = '{game_details[3]}'
            AND they_scored = '{game_details[4]}'
            AND date = '{game_details[5]}'
        """
        gameID = self._sql_return(query)[0][0][0]
        print("here2")

        #pointsList = [MotM[+3], turnedUp[+1], halfGame[+1], scored[+3], assist[+2], goalieSave[+2], defenceCleanSheet[+3], champagne[+2], DotD[-2], yellow[-1], red[-3], penalty[-3], shitter[-1], ownGoal[-1], 2xConceed[-1]]
        pointsList = ["+ 3",  "+ 1", "+ 1", "+ 3", "+ 2", "+ 2", "+ 3", "+ 2", "- 2", "- 1", "- 3", "- 3", "- 1", "-2", "-1"]

        self._update_cred(eventList, pointsList, 'players', 'gpoints', 'gameID', gameID)
        
        return None

    # ----------------------------------------------------------------------------------------------------------------------

    def add_socail(self, soc_details, eventList):
        #1: Locarion, 2: date
        query = f"""
        INSERT INTO socials (location, date) 
        VALUES ('{soc_details[0]}', '{soc_details[1]}');
        """
        self._sql_cmd(query)

        query = f"""
        SELECT socialID
        FROM socials
        WHERE
            location = '{soc_details[0]}'
            AND date = '{soc_details[1]}';
        """
        socialID = self._sql_return(query)[0][0][0]
    
        #pointsList = [getWiths[+1], activitites[+3], drinks[+1], racesWon[+1], racesLost[-1], chunders[-2], fumbles[-1]]
        pointsList = ["+ 1","+ 3","+ 1","+ 1","- 1","- 2","- 1"]

        self._update_cred(eventList, pointsList, 'socials', 'spoints', 'socialID', socialID)

        return None

    # ----------------------------------------------------------------------------------------------------------------------

    def _update_cred(self, eventsPass, pointsList, table1, table2, IDName, itemID):

        eventsList = []
        for i in range(len(eventsPass)):
            if len(eventsPass[i]) > 0:
                for j in range(len(eventsPass[i])):
                    eventsList.append([eventsPass[i][j][0], i, eventsPass[i][j][2]])
        print("here3")
        queryList = []
        for event in eventsList:
            queryList.append(f"UPDATE {table1} SET new_points = new_points {pointsList[event[1]]}*{event[2]} WHERE playerID = {event[0]};")
            queryList.append(f"INSERT INTO {table2} (playerID, {IDName}, pointID, quant) VALUES ('{event[0]}', '{itemID}', '{event[1] + 1}', '{event[2]}');")

        self._sql_cmd(queryList)
        print("here4")

        # UPDATE RECORDED POINTS, USERS POINTS
        average = round(self._sql_return("SELECT AVG(new_points) AS average_new_points FROM players;")[0][0][0])
        print("here5")
        queryList = []
        queryList.append(f"UPDATE players SET cost = cost + ((new_points - {average})*50);")
        queryList.append(f"UPDATE players SET recorded_points = recorded_points + new_points;")

        queryTemp = f"""
        UPDATE users AS u
        JOIN captain AS c ON u.userID = c.userID
        JOIN players AS p ON c.playerID = p.playerID
        SET u.points = u.points + (p.new_points);
        """
        queryList.append(queryTemp)
        
        queryTemp = f"""
        UPDATE users AS u
        JOIN fantasy AS f ON u.userID = f.userID
        JOIN players AS p ON f.playerID = p.playerID
        SET u.points = u.points + (p.new_points);
        """
        queryList.append(queryTemp)

        queryList.append(f"UPDATE players AS p SET p.new_points = 0;")

        self._sql_cmd(queryList)
        print("here6")

        return None
    
    # ----------------------------------------------------------------------------------------------------------------------

    # def upload_image(self, image, imageID):
    #     # Load the environment variables
    #     access_key = os.getenv('PICTURE_ACCESS_KEY_ID')
    #     secret_key = os.getenv('PICTURE_SECRET_ACCESS_KEY')
    #     region = os.getenv('PICTURE_REGION')
    #     bucket_name = os.getenv('IMAGE_S3_BUCKET')
    #     prefix = os.getenv('BUCKET_PREFIX', '')  # Default to empty string if not set

    #     # Configure boto3 client with your credentials
    #     s3 = boto3.client(
    #         's3',
    #         aws_access_key_id=access_key,
    #         aws_secret_access_key=secret_key,
    #         region_name=region
    #     )
        
    #     # Create the file key
    #     file_key = f"{prefix}player{imageID}.png"  # Prefixing the key with 'profilePics/'

    #     # Upload the image to S3
    #     s3.upload_fileobj(image, bucket_name, file_key)
    #     return None
    def upload_image(self, image, imageID):
        # Log the image content before upload
        image.seek(0)  # Ensure we're at the start of the file
        file_content = image.read(100)  # Read a small part of the file for logging
        print(f"Uploading image with ID {imageID}. File preview (first 100 bytes): {file_content}")
        print(f"File size: {len(file_content)} bytes")

        # Load the environment variables
        access_key = os.getenv('PICTURE_ACCESS_KEY_ID')
        secret_key = os.getenv('PICTURE_SECRET_ACCESS_KEY')
        region = os.getenv('PICTURE_REGION')
        bucket_name = os.getenv('PICTURE_S3_BUCKET')
        prefix = os.getenv('PICTURE_PREFIX', '')

        # Configure boto3 client with your credentials
        s3 = boto3.client(
            's3',
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region
        )

        # Create the file key
        file_key = f"{prefix}player{imageID}.png"  # Prefixing the key with 'profilePics/'

        # Upload the image to S3
        image.seek(0)  # Make sure we're at the beginning of the file before uploading
        s3.upload_fileobj(image, bucket_name, file_key)
        print(f"Image uploaded successfully to S3 with key {file_key}")
        return None

    
    # ----------------------------------------------------------------------------------------------------------------------

    def delete_image(self, imageID):
        print("deleting Image")
        # Load the environment variables
        access_key = os.getenv('PICTURE_ACCESS_KEY_ID')
        secret_key = os.getenv('PICTURE_SECRET_ACCESS_KEY')
        region = os.getenv('PICTURE_REGION')
        bucket_name = os.getenv('PICTURE_S3_BUCKET')
        prefix = os.getenv('PICTURE_PREFIX', '') 
        print("1")
        # Configure boto3 client with your credentials
        s3 = boto3.client(
            's3',
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region
        )
        print("2")
        file_key = f"{prefix}player{imageID}.png"  # Construct the key based on the imageID and prefix
        s3.delete_object(Bucket=bucket_name, Key=file_key)
        print("Image gone")
        return None

    # ----------------------------------------------------------------------------------------------------------------------

    def backup(self):
        # Perform MySQL database backup
        backupID = pendulum.now('Europe/London').strftime('%Y_%m_%d_%H_%M_%S')
        backup_file_name = f"sql-backup-{backupID}.sql"  # Construct the backup file name
        backup_file_path = os.path.join('app', 'tempStore', backup_file_name)  # Specify the local backup directory

        backup_process = subprocess.Popen(
            ['mysqldump',
            f'--host={os.environ["MYSQL_URL"]}',
            f"--user=root",
            f'--password={os.environ["MYSQL_ROOT_PASSWORD"]}',
            '--single-transaction',
            '--complete-insert',
            os.environ["DB_NAME"]], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        with open(backup_file_path, 'w') as backup_file:
            backup_output, backup_error = backup_process.communicate()
            backup_file.write(backup_output)

        if backup_process.returncode == 0:
            s3 = boto3.client('s3')  # Create an S3 client

            # Upload backup to S3
            s3_key = f"{os.environ['BUCKET_PREFIX']}{backup_file_name}"  # S3 key where the backup will be stored
            s3.upload_file(backup_file_path, os.environ["BACKUP_S3_BUCKET"], s3_key)

            print(f'Successfully backed up and uploaded to S3: {s3_key}')
        else:
            print(f'Backup failed: {backup_error}')

        # Clean up: Remove the local backup file
        if os.path.exists(backup_file_path):
            os.remove(backup_file_path)
        
        return backupID

    # ----------------------------------------------------------------------------------------------------------------------

    def get_backups(self):

        dates = self._list_backups()
            
        response = sorted(dates, key=lambda date_str: datetime.strptime(date_str, "%Y_%m_%d_%H_%M_%S"), reverse=True)
        response = sorted(dates, key=lambda date_str: datetime.strptime(date_str, "%Y_%m_%d_%H_%M_%S"), reverse=True)

        return response

    # ----------------------------------------------------------------------------------------------------------------------

    def _list_backups(self):
        backup_ids = list()

        s3 = boto3.client('s3')  # Create an S3 client
        # response = s3.list_objects_v2(Bucket=os.getenv("BACKUP_S3_BUCKET"))
        response = s3.list_objects_v2(
            Bucket=os.getenv("BACKUP_S3_BUCKET"), Prefix=os.getenv("BUCKET_PREFIX"))
        for obj in response['Contents']:
            item = obj['Key']
            if item.endswith("sql"):
                backup_ids.append(item.split("-")[-1].split("/")[0].split(".")[0])

        return backup_ids

    # ----------------------------------------------------------------------------------------------------------------------

    def restore(self, backupID):
        # Download the SQL dump file from S3
        s3 = boto3.client('s3')
        restore_file_path = os.path.join('app', 'tempStore', 'backup.sql')  # Specify the local backup directory
        s3.download_file(os.getenv("BACKUP_S3_BUCKET"), f'{os.environ["BUCKET_PREFIX"]}sql-backup-{backupID}.sql', restore_file_path)

        # Restore the database using the mysql command
        with open(restore_file_path, 'rb') as sql_file:
            subprocess.run([
            'mysql',
            f'--host={os.environ["MYSQL_URL"]}',
            f"--user=root",
            f'--password={os.environ["MYSQL_ROOT_PASSWORD"]}',
            os.environ["DB_NAME"]], stdin=sql_file, text=True, check=True)

        # Clean up: Remove the downloaded SQL dump file
        if os.path.exists(restore_file_path):
            os.remove(restore_file_path)
        
        return None

    # ----------------------------------------------------------------------------------------------------------------------

    def removeBack(self, backupID):
        s3 = boto3.client('s3') # Create an S3 client
        bucket_name = os.environ["BACKUP_S3_BUCKET"]
        file_key = f"{os.environ['BUCKET_PREFIX']}sql-backup-{backupID}.sql"
        
        s3.delete_object(Bucket=bucket_name, Key=file_key)

        return None

    # ----------------------------------------------------------------------------------------------------------------------

    def _alphabetic_2darray(self, array, textIndex):

        alphabetical_array = [[] for _ in range(27)]  # 26 alphabets + 1 for filenames starting with non-alphabets

        # Group filenames based on their first letter
        for instance in array:
            first_letter = instance[textIndex][0].upper()
            if first_letter.isalpha():
                index = ord(first_letter) - ord('A')
            else:
                index = 26
            alphabetical_array[index].append(instance)

        sorted_array = []
        # Sort the lists
        for array_list in alphabetical_array:
            sorted_array.append(sorted(array_list, key=lambda x: x[textIndex]))

        return sorted_array
    
    # ----------------------------------------------------------------------------------------------------------------------
    # ----------------------------------------------------------------------------------------------------------------------
    # ----------------------------------------------------------------------------------------------------------------------
    # ----------------------------------------------------------------------------------------------------------------------
    # ----------------------------------------------------------------------------------------------------------------------

    def _wrap_query(self, input_val):
        if isinstance(input_val, str):
            return [input_val]
        elif isinstance(input_val, list):
            return input_val

    # ----------------------------------------------------------------------------------------------------------------------

    def _sql_cmd(self, input):
        query = self._wrap_query(input)
        client = {
            'host': os.environ["MYSQL_URL"],
            'user': 'root',
            'password': os.environ["MYSQL_ROOT_PASSWORD"],
            'database': os.environ["DB_NAME"],
        }    

        # Establish a database connection
        connection = mysql.connector.connect(**client)
        
        # Create a cursor object to execute SQL queries
        cursor = connection.cursor()

        for item in query:
            # Execute the query
            cursor.execute(item)

        # Commit the changes
        connection.commit()

        # Close connection
        cursor.close()
        connection.close()

        return None
    
    # ----------------------------------------------------------------------------------------------------------------------

    def _sql_return(self, input):
        query = self._wrap_query(input)
        client = {
            'host': os.environ["MYSQL_URL"],
            'user': 'root',
            'password': os.environ["MYSQL_ROOT_PASSWORD"],
            'database': os.environ["DB_NAME"],
        }    

        # Establish a database connection
        connection = mysql.connector.connect(**client)
        
        # Create a cursor object to execute SQL queries
        cursor = connection.cursor()

        result = []

        for item in query:
            # Execute the query
            cursor.execute(item)

            # Fetch the result
            result.append(cursor.fetchall())

        # Close connection
        cursor.close()
        connection.close()

        return result