import os
from dotenv import load_dotenv
import mysql.connector
import string
import random
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

class FantasyClient:
    def __init__(self):
        load_dotenv()
        self.user_id = 0
        self.client = {
            'host': os.environ["MYSQL_URL"],
            'user': 'root',
            'password': os.environ["MYSQL_ROOT_PASSWORD"],
            'database': os.environ["DB_NAME"],
        }      

    # ----------------------------------------------------------------------------------------------------------------------

    #################################               VERIFIED
    def login_user(self, email, pword):
        auth, result = self._auth_user(email, pword)
        if auth:
            response = True
            self.user_id = result

        else:
            response = False

        return response

    # ----------------------------------------------------------------------------------------------------------------------

    #################################               VERIFIED
    def _auth_user(self, email, pword):
        auth = False
        id = 0

        # Define the SQL query to check if the user password correct
        query = f"""
        SELECT users.userID
        FROM users
        WHERE email = '{email}' AND password = '{pword}';
        """

        result = self._sql_return(query)

        if len(result[0])  > 0:
            auth = True  
            id =  result[0][0][0]

        return auth, id
    
    # ----------------------------------------------------------------------------------------------------------------------

    #################################               VERIFIED
    def get_user_id(self):
        return self.user_id
    
    # ----------------------------------------------------------------------------------------------------------------------

    #################################               VERIFIED
    def get_team(self):
        query = []

        queryTeam = f"""
        SELECT p.playerID, p.first_name, p.last_name, p.recorded_points, p.cost, p.position
        FROM players p
        JOIN fantasy f ON p.playerID = f.playerID
        WHERE f.userID = '{self.user_id}'
        """
        query.append(queryTeam)

        queryCap = f"""
        SELECT p.playerID
        FROM players p
        JOIN captain c ON p.playerID = c.playerID
        WHERE c.userID = '{self.user_id}'
        """
        query.append(queryCap)

        queryBudget = f"""
        SELECT u.rem_budget
        FROM users u
        WHERE u.userID = '{self.user_id}'
        """
        query.append(queryBudget)

        resultTeam, resultCap, resultBudget = self._sql_return(query)
        all_budg = resultBudget[0][0]

        capID = -1
        if len(resultCap) > 0:
            capID = resultCap[0][0]

        for i in range(0, len(resultTeam)):
            all_budg += resultTeam[i][4]

        team = [list(item) for item in resultTeam]
        extendTeam = 6 - len(team)

        for i in range(0, extendTeam):
            team.append([-2, "---", "---", 0, 0, "---"])

        return team, capID, all_budg

    # ----------------------------------------------------------------------------------------------------------------------

    #################################               VERIFIED
    def get_players(self):
        query = f"""
        SELECT p.playerID, p.first_name, p.last_name, p.recorded_points, p.cost, p.position
        FROM players p;
        """

        result = [list(item) for item in self._sql_return(query)[0]]
        sorted_leader =  sorted(result, key=lambda x: x[4], reverse=True)

        return sorted_leader
        # Sorted playerID, first_name, last_name, cost, recorded_points**, position

    # ----------------------------------------------------------------------------------------------------------------------

    #################################               VERIFIED
    def leaderboard(self):
        query = f"""
        SELECT users.userID, users.first_name, users.last_name, users.points
        FROM users
        """

        result = self._sql_return(query)[0]
        leaderboard = []
        
        for i in range(0, len(result)):
            leaderboard.append([result[i][0], f"{result[i][1]} {result[i][2]}", int(result[i][3])])

        # Sort the array by score in ascending order
        sorted_leader =  sorted(leaderboard, key=lambda x: x[2], reverse=True)

        return sorted_leader
        # Sorted userID, (first_name last_name), points**
    
    # ----------------------------------------------------------------------------------------------------------------------

    #################################               VERIFIED
    def change_team(self, team, captain, budgLeft):
        currTeam, currCap = self._curr_team()
        team = [x for x in team if x != -2]

        filtered_team = []

        for item in team:
            if item != -2:
                filtered_team.append(item)

        # Calculate the elements that were removed (in old_list but not in new_list)
        remove = [item for item in currTeam if item not in filtered_team]

        # Calculate the elements that were added (in new_list but not in old_list)
        add = [item for item in filtered_team if item not in currTeam]

        queryList = []
        
        if currCap == -1:
            queryTemp = f"""
            INSERT INTO captain 
            (userID, playerID) 
            VALUES ('{self.user_id}', '{captain}');
            """
            queryList.append(queryTemp)

        else:
            if (not captain == currCap):
                queryTemp = f"""
                UPDATE captain AS c
                SET c.playerID = {captain}
                WHERE c.userID = '{self.user_id}'
                """
                queryList.append(queryTemp)

            elif captain == -1:
                queryTemp = f"""
                DELETE FROM captain AS c
                WHERE c.userID = '{self.user_id}'
                """
                queryList.append(queryTemp)

        queryTemp = f"""
        UPDATE users AS u
        SET u.rem_budget = {budgLeft}
        WHERE u.userID = '{self.user_id}'
        """
        queryList.append(queryTemp)

        for i in range(len(remove)):
            queryTemp = f"""
            UPDATE fantasy AS f
            SET f.playerID = {add[i]}
            WHERE f.userID = '{self.user_id}' AND f.playerID = {remove[i]}
            """
            queryList.append(queryTemp)

        if len(add) > len(remove):
            for i in range(0, len(add) - len(remove)):
                queryTemp = f"""
                INSERT INTO fantasy 
                (userID, playerID) 
                VALUES ('{self.user_id}', '{str(add[i+len(remove)])}');
                """
                queryList.append(queryTemp)

        self._sql_cmd(queryList)

        return None
    
    # ----------------------------------------------------------------------------------------------------------------------

    #################################               VERIFIED
    def _curr_team(self):
        query = []

        queryTeam = f"""
        SELECT p.playerID
        FROM players p
        JOIN fantasy f ON p.playerID = f.playerID
        WHERE f.userID = '{self.user_id}'
        """
        query.append(queryTeam)

        queryCap = f"""
        SELECT p.playerID
        FROM players p
        JOIN captain c ON p.playerID = c.playerID
        WHERE c.userID = '{self.user_id}'
        """
        query.append(queryCap)

        resultTeam, resultCap = self._sql_return(query)
        team = [item[0] for item in resultTeam]

        currCap = -1
        if len(resultCap) > 0:
            currCap = resultCap[0][0]
        
        return team, currCap

    # ----------------------------------------------------------------------------------------------------------------------

    #################################               VERIFIED
    def get_players_alphabetical(self):
        query = f"""
        SELECT p.playerID, p.first_name, p.last_name, p.recorded_points, p.cost, p.position
        FROM players p;
        """

        players = []
        result = self._sql_return(query)[0]

        for item in result:
            players.append([item[0], f"{item[1]} {item[2]}", item[3], item[4], item[5]])

        alphabetic_players = self._alphabetic_2darray(players, 1)

        return alphabetic_players
    
    # ----------------------------------------------------------------------------------------------------------------------

    #################################               VERIFIED
    def get_players_stats(self, playID):
        gameEventsList = []
        socialEventsList = []
        playerName = ""

        exists = False   
        countQuery = f"""
        SELECT first_name
        FROM players
        WHERE playerID = '{playID}';
        """
        result = self._sql_return(countQuery)

        if result and len(result[0]) > 0:
            exists = True 
            playerName = result[0][0][0]  

            queryList = []

            query = f"""
            SELECT gp.pointID, g.opponent, gp.quant, g.date
            FROM gpoints gp
            JOIN games g ON g.gameID = gp.gameID
            WHERE gp.playerID = '{playID}'
            ORDER BY g.date;
            """
            queryList.append(query)

            query = f"""
            SELECT sp.pointID, s.location, sp.quant, s.date
            FROM spoints sp
            JOIN socials s ON s.socialID = sp.socialID
            WHERE sp.playerID = '{playID}'
            ORDER BY s.date;
            """
            queryList.append(query)

            gameEvents, socialEvents = self._sql_return(queryList)

            gameEventsList = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []]
            socialEventsList = [[], [], [], [], [], [], []]
            for event in gameEvents:
                date = str(event[3]).split("-")
                gameEventsList[event[0] - 1].append([event[1], event[2], f"{date[2]}/{date[1]}/{date[0]}"])
            
            for event in socialEvents:
                date = str(event[3]).split("-")
                socialEventsList[event[0] - 1].append([event[1], event[2], f"{date[2]}/{date[1]}/{date[0]}"])

        return exists, playerName, gameEventsList, socialEventsList
    
    # ----------------------------------------------------------------------------------------------------------------------

    #################################               VERIFIED
    def get_rules(self):

        socialRules = [["Get with girl/boy", "+1"], ["Bedroom Activities", "+3"], ["x5 Jaegerbombs", "+1"], ["Pint Race Won", "+1"], ["Pint Race Lost", "-1"], ["Chunder", "-2"], ["Fumble", "-1"]]
        gameRules = [["MotM", "+3"], ["Turn up to Game", "+1"], ["Play half game", "+1"], ["Scored Goal", "+3"], ["Assist", "+2"], ["Goalie Save", "+2"], ["Defence Clean Sheet (0 conceded)", "+3"], ["Champagne Moment", "+2"], ["DotD", "-2"], ["Yellow Card", "-1"], ["Red Card", "-3"], ["Give Penalty", "-3"], ["Shitter (Miss open goal)", "-1"], ["Own Goal", "-1"], ["Goalie Conceded 2 goals", "-1"]]

        return socialRules, gameRules

    # ----------------------------------------------------------------------------------------------------------------------

    #################################               VERIFIED
    def create_user(self, email, fName, sName):
        response = False
        if not self._user_exists(email):
            #generate temp password
            pword = self._gen_password(10)
            self._email_user(email, "Your RSM Fantasy Password", f"Your temporary password is {pword} .")
            # Define the SQL query to check if the user exists
            query = f"""
            INSERT INTO users 
            (email, password, first_name, last_name) 
            VALUES ('{email}', '{pword}', '{fName}', '{sName}');
            """

            self._sql_cmd(query)
            
            response = True

        return response
        
     # ----------------------------------------------------------------------------------------------------------------------
    
    #################################               VERIFIED
    def _user_exists(self, email):
        exists = False

        # Define the SQL query to check if the user exists
        query = f"""
        SELECT COUNT(*) AS user_count
        FROM users
        WHERE email = '{email}';
        """

        result = self._sql_return(query)

        if result and result[0][0][0] > 0:
            exists = True   

        return exists

    # ----------------------------------------------------------------------------------------------------------------------

    #################################               VERIFIED
    def _gen_password(self, length):
        # Define the set of characters to choose from
        characters = string.ascii_letters + string.digits
        valid_characters = [c for c in characters if c not in "/'`#"]
        
        # Generate a random string of the specified length
        random_string = ''.join(random.choice(valid_characters) for _ in range(length))

        return random_string

    # ----------------------------------------------------------------------------------------------------------------------

    #################################               VERIFIED
    def _email_user(self, email, subject, contents):
        # Gmail SMTP server details
        smtp_server = 'smtp.gmail.com'
        smtp_port = 587
        smtp_username = os.environ['EMAIL_USER']  # Your Gmail email address
        smtp_password = os.environ['EMAIL_PWORD']  # Your Gmail password

        # Create the email message
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = email 
        msg['Subject'] = subject

        # Add the email body (plain text)
        email_body = contents
        msg.attach(MIMEText(email_body, 'plain'))

        # Connect to the SMTP server and send the email
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()  # Enable TLS encryption
        server.login(smtp_username, smtp_password)  # Login to your Gmail account

        text = msg.as_string()
        server.sendmail(smtp_username, email, text)  # Send the email

        server.quit()

        return None

    # ----------------------------------------------------------------------------------------------------------------------
    
    #################################               VERIFIED
    def update_password(self, password, newPass):

        response = False
        if self._check_pword(password):

            query = f"""
            UPDATE users
            SET password = '{newPass}'
            WHERE userID = '{self.user_id}';
            """

            self._sql_cmd(query)
            response = True

        return response

    # ----------------------------------------------------------------------------------------------------------------------

    #################################               VERIFIED
    def _check_pword(self, password):
        exists = False

        # Define the SQL query to check if the user exists
        query = f"""
        SELECT COUNT(*) AS user_count
        FROM users
        WHERE userID = '{self.user_id}' AND password = '{password}';
        """

        result = self._sql_return(query)

        if result and result[0][0][0] > 0:
            exists = True   

        return exists

    # ----------------------------------------------------------------------------------------------------------------------

    #################################               VERIFIED
    def forgot_password(self, email):
        response = False
        if self._user_exists(email):
            #generate temp password
            pword = self._gen_password(10)
            self._email_user(email, "Your RSM Fantasy Password", f"Your temporary password is {pword} .")
            # Define the SQL query to check if the user exists
            query = f"""
            UPDATE users
            SET password = '{pword}'
            WHERE email = '{email}';
            """

            self._sql_cmd(query)
            response = True

        return response
    
    # ----------------------------------------------------------------------------------------------------------------------

    #################################               VERIFIED
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

        # Establish a database connection
        connection = mysql.connector.connect(**self.client)
        
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

        # Establish a database connection
        connection = mysql.connector.connect(**self.client)
        
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