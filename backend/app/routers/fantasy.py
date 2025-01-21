from fastapi import APIRouter, File, UploadFile, Request, Form
from fastapi.exceptions import HTTPException
from pydantic import BaseModel
import logging.config
import yaml
from ..gameLib import FantasyClient
from ..adminLib import AdminClient

router = APIRouter()

# ----------------------------------------------------------------------------------------------------------------------

class userAuth(BaseModel):
    email: str
    password: str

class updateTeam(BaseModel):
    team: list
    capID: int
    budgLeft: int

class addUser(BaseModel):
    email: str
    fName: str
    sName: str

class forPass(BaseModel):
    email: str

class updatePass(BaseModel):
    newPass: str
    oldPass: str

class Item(BaseModel):
    itemID: int

# ----------------------------------------------------------------------------------------------------------------------

# Initialise logging
try:
    with open("app/log_config.yml", "r") as f:
        config = yaml.safe_load(f.read())
        logging.config.dictConfig(config)

    log = logging.getLogger(__name__)

except:
    raise HTTPException(status_code=400, detail=f"Failed to continue service logging.")

# ----------------------------------------------------------------------------------------------------------------------

userclient = FantasyClient()
email = ""

# ----------------------------------------------------------------------------------------------------------------------

@router.post("/accessuser/")
async def access_user(auth: userAuth, request: Request):
    global email
    try:    
        resp = userclient.login_user(auth.email, auth.password)
        if resp:
            email = auth.email
            response = "True"
        else:
            response = "False"
        
    except Exception as e:
        log.error(f"POST /ACCESSUSER from host {request.client.host}, error: {str(e)}")
        response = "Error"

    return response

# ----------------------------------------------------------------------------------------------------------------------

@router.post("/gethomepage/")
async def get_team(request: Request):
    team = []
    capID = 0
    all_budg = 0
    players = []
    leaderboard = []
    try:
        if not userclient.get_user_id() == 0: 
            team, capID, all_budg = userclient.get_team()
            players = userclient.get_players()
            leaderboard  = userclient.leaderboard()
            response = "True"
        else:
            response = "No"

    except Exception as e:
        log.error(f"POST /GETHOMEPAGE from host {request.client.host}, error: {str(e)}")
        response = "Error"

    return response, team, capID, all_budg, players, leaderboard

# ----------------------------------------------------------------------------------------------------------------------

@router.post("/changeteam/")
async def change_team(updateteam: updateTeam, request: Request):
    try:
        if not userclient.get_user_id() == 0: 
            response = "True"
            userclient.change_team(updateteam.team, updateteam.capID, updateteam.budgLeft)
        else:
            response = "No"

    except Exception as e:
        log.error(f"POST /CHANGETEAM from host {request.client.host}, error: {str(e)}")
        response = "Error"

    return response

# ----------------------------------------------------------------------------------------------------------------------

@router.post("/userplayers/")
async def list_socials(request: Request):
    players = []
    try:
        if not userclient.get_user_id() == 0: 
            response = "True"
            players  = userclient.get_players_alphabetical()
        else:
            response = "No"

    except Exception as e:
        response = "Error"
        log.error(f"POST /GETSOCIALS called from host {request.client.host}, error: {str(e)}")

    return response, players

# ----------------------------------------------------------------------------------------------------------------------

@router.post("/userplayerstats/")
async def list_socials(item: Item, request: Request):
    gameEventsList = []
    socialEventsList = []
    playName = ""
    try:
        if not userclient.get_user_id() == 0: 
            response = "True"
            exists, playName, gameEventsList, socialEventsList  = userclient.get_players_stats(item.itemID)
            if not exists:
                response = "False"
        else:
            response = "No"
            

    except Exception as e:
        response = "Error"
        log.error(f"POST /GETSOCIALS called from host {request.client.host}, error: {str(e)}")

    return response, playName, gameEventsList, socialEventsList

# ----------------------------------------------------------------------------------------------------------------------

@router.post("/userrules/")
async def list_socials(request: Request):
    socailRules = []
    gameRules = []
    try:
        if not userclient.get_user_id() == 0: 
            response = "True"
            socailRules, gameRules  = userclient.get_rules()
        else:
            response = "No"
            

    except Exception as e:
        response = "Error"
        log.error(f"POST /GETSOCIALS called from host {request.client.host}, error: {str(e)}")

    return response, socailRules, gameRules

# ----------------------------------------------------------------------------------------------------------------------

@router.post("/updatepassword/")
async def update_password(updatepass: updatePass, request: Request):
    try:
        if not userclient.get_user_id() == 0: 
            if userclient.update_password(updatepass.oldPass, updatepass.newPass):
                response = "True"
            else:
                response = "False"
        else:
            response = "No"
    except Exception as e:
        log.error(f"POST /CREATEUSER from host {request.client.host}, error: '{str(e)}'")
        response = "Error"

    return response

# ----------------------------------------------------------------------------------------------------------------------

@router.post("/createuser/")
async def create_user(adduser: addUser, request: Request):
    try:
        if userclient.create_user(adduser.email, adduser.fName, adduser.sName):
            response = "True"
            log.info(f"POST /createuser called from host {request.client.host} for {adduser.email}")
        else:
            response = "False"

    except Exception as e:
        log.error(f"POST /CREATEUSER from host {request.client.host}, error: '{str(e)}'")
        response = "Error"

    return response

# ----------------------------------------------------------------------------------------------------------------------

@router.post("/forgotpass/")
async def forgot_pass(forpass: forPass, request: Request):
    try:
        if userclient.forgot_password(forpass.email):
            response = "True"
        else:
            response = "No"

    except Exception as e:
        log.error(f"POST /CREATEUSER from host {request.client.host}, error: '{str(e)}'")
        response = "Error"

    return response

# ----------------------------------------------------------------------------------------------------------------------
# ----------------------------------------------------------------------------------------------------------------------
# ----------------------------------------------------------------------------------------------------------------------
# ----------------------------------------------------------------------------------------------------------------------
# ----------------------------------------------------------------------------------------------------------------------
# ----------------------------------------------------------------------------------------------------------------------

class adminAuth(BaseModel):
    key: str
    name: str

class adminBackup(BaseModel):
    backupID: str

class addPlayer(BaseModel):
    fName: str
    sName: str
    baseCost: int
    position: str

class updatePlayer(BaseModel):
    playerID: int
    cost: int
    points: int
    position: str

class updateUser(BaseModel):
    userID: int
    budget: int
    points: int

class addEvent(BaseModel):
    details: list
    eventList: list

# ----------------------------------------------------------------------------------------------------------------------

adminclient = AdminClient()
admin = ""

@router.post("/accessadmin/")
async def authentification(auth: adminAuth, request: Request):
    try:
        if adminclient.auth_user(auth.key):
            global admin
            admin = auth.name
            response = "True"
        else:
            response = "False"
            log.error(f"{admin} Attempted to access ADMIN. Host {request.client.host}")
    except Exception as e:
        log.info(f"POST /ACCESSUSER called from host {request.client.host}, error: {str(e)}")
        response = f"Error"

    return response

# ----------------------------------------------------------------------------------------------------------------------

@router.post("/addplayer/")
async def add_player(addplay: addPlayer, request: Request):
    try:
        if adminclient.check_auth(): 
            if addplay.fName.isalpha() and addplay.sName.isalpha():
                adminclient.add_player(addplay.fName, addplay.sName, addplay.baseCost, addplay.position)
                response = "True"
            else:
                response = "False"
        else:
            response = "No"
    except Exception as e:
        log.error(f"POST /ADDPLAYER from host {request.client.host}, error: '{str(e)}'")
        response = "Error"

    return response

# ----------------------------------------------------------------------------------------------------------------------

@router.post("/getplayerid/")
async def add_player(getplayer: addPlayer, request: Request):
    playID = 0
    try:
        if adminclient.check_auth(): 
            playID = adminclient.get_playerID(getplayer.fName, getplayer.sName, getplayer.baseCost, getplayer.position)
            response = "True"
        else:
            response = "No"
    except Exception as e:
        log.error(f"POST /ADDPLAYER from host {request.client.host}, error: '{str(e)}'")
        response = "Error"

    return response, playID
# ----------------------------------------------------------------------------------------------------------------------

@router.post("/removeplayer/")
async def remove_player(item: Item, request: Request):
    try:
        if adminclient.check_auth(): 
            adminclient.delete_player(item.itemID)
            adminclient.delete_image(item.itemID)
            response = "True"
        else:
            response = "No"
    except Exception as e:
        log.error(f"POST /REMOVEPLAYER from host {request.client.host}, error: '{str(e)}'")
        response = "Error"

    return response

# ----------------------------------------------------------------------------------------------------------------------

@router.post("/playerlead/")
async def players_lead(request: Request):
    leaderboard = []
    try:
        if adminclient.check_auth(): 
            response = "True"
            leaderboard  = adminclient.leaderboard_players()
        else:
            response = "No"
            
    except Exception as e:
        response = "Error"
        log.error(f"POST /PLAYERLEAD called from host {request.client.host}, error: {str(e)}")

    return response, leaderboard
# ----------------------------------------------------------------------------------------------------------------------

@router.post("/userlead/")
async def users_lead(request: Request):
    leaderboard = []
    try:
        if adminclient.check_auth(): 
            response = "True"
            leaderboard  = adminclient.leaderboard_users()
        else:
            response = "No"
            
    except Exception as e:
        response = "Error"
        log.error(f"POST /USERLEAD called from host {request.client.host}, error: {str(e)}")

    return response, leaderboard

# ----------------------------------------------------------------------------------------------------------------------

@router.post("/updateuser/")
async def update_user(updatepers: updateUser, request: Request):
    try:
        if adminclient.check_auth(): 
            response = "True"
            adminclient.update_user(updatepers.userID, updatepers.points, updatepers.budget)
        else:
            response = "No"
            
    except Exception as e:
        response = "Error"
        log.error(f"POST /UPDATEUSER called from host {request.client.host}, error: {str(e)}")

    return response

# ----------------------------------------------------------------------------------------------------------------------

@router.post("/updateplayer/")
async def update_player(updatepers: updatePlayer, request: Request):
    try:
        if adminclient.check_auth(): 
            response = "True"
            adminclient.update_player(updatepers.playerID, updatepers.cost, updatepers.points, updatepers.position)
        else:
            response = "No"
            
    except Exception as e:
        response = "Error"
        log.error(f"POST /UPDATEPLAYER called from host {request.client.host}, error: {str(e)}")

    return response

# ----------------------------------------------------------------------------------------------------------------------

@router.post("/games/")
async def list_games(request: Request):
    games = []
    try:
        if adminclient.check_auth() or not userclient.get_user_id() == 0: 
            response = "True"
            games  = adminclient.get_games()
        else:
            response = "No"
            

    except Exception as e:
        response = "Error"
        log.error(f"POST /GETGAMES called from host {request.client.host}, error: {str(e)}")

    return response, games

# ----------------------------------------------------------------------------------------------------------------------

@router.post("/gameoverview/")
async def game_over(item: Item, request: Request):
    details = []
    events = []
    try:
        if adminclient.check_auth() or not userclient.get_user_id() == 0: 
            response = "True"
            exists, details, events  = adminclient.game_overview(item.itemID)
            if not exists:
                response = "False"
        else:
            response = "No"
            

    except Exception as e:
        response = "Error"
        log.error(f"POST /GAMESOVER called from host {request.client.host}, error: {str(e)}")

    return response, details, events

# ----------------------------------------------------------------------------------------------------------------------

@router.post("/socials/")
async def list_socials(request: Request):
    socials = []
    try:
        if adminclient.check_auth() or not userclient.get_user_id() == 0: 
            response = "True"
            socials  = adminclient.get_socials()
        else:
            response = "No"
            

    except Exception as e:
        response = "Error"
        log.error(f"POST /GETSOCIALS called from host {request.client.host}, error: {str(e)}")

    return response, socials

# ----------------------------------------------------------------------------------------------------------------------

@router.post("/socialoverview/")
async def social_over(item: Item, request: Request):
    details = []
    events = []
    try:
        if adminclient.check_auth() or not userclient.get_user_id() == 0: 
            response = "True"
            exists, details, events  = adminclient.social_overview(item.itemID)
            if not exists:
                response = "False"
        else:
            response = "No"
            

    except Exception as e:
        response = "Error"
        log.error(f"POST /SOCIALOVER called from host {request.client.host}, error: {str(e)}")

    return response, details, events

# ----------------------------------------------------------------------------------------------------------------------

@router.post("/getplayers/")
async def add_game(request: Request):
    players = []
    try:
        if adminclient.check_auth(): 
            response = "True"
            players  = adminclient.get_players()
        else:
            response = "No"
            
    except Exception as e:
        response = "Error"
        log.error(f"POST /ADDGAME called from host {request.client.host}, error: {str(e)}")

    return response, players

# ----------------------------------------------------------------------------------------------------------------------

@router.post("/addgame/")
async def add_game(addevent: addEvent, request: Request):
    try:
        if adminclient.check_auth(): 
            response = "True"
            adminclient.add_game(addevent.details, addevent.eventList)
        else:
            response = "No"
            
    except Exception as e:
        response = "Error"
        log.error(f"POST /ADDGAME called from host {request.client.host}, error: {str(e)}")

    return response

# ----------------------------------------------------------------------------------------------------------------------

@router.post("/addsocial/")
async def add_social(addevent: addEvent, request: Request):
    try:
        if adminclient.check_auth(): 
            response = "True"
            leaderboard  = adminclient.add_socail(addevent.details, addevent.eventList)
        else:
            response = "No"
            
    except Exception as e:
        response = "Error"
        log.error(f"POST /ADDSOCIAL called from host {request.client.host}, error: {str(e)}")

    return response

# ----------------------------------------------------------------------------------------------------------------------

@router.post("/uploadpicture/")
async def upload_pic(request: Request, fileID: int = Form(...), file: UploadFile = File(...)):
    try:
        if adminclient.check_auth(): 
            response = "True"
            adminclient.upload_image(file.file, fileID)
        else:
            response = "No"

    except Exception as e:
        response = "Error"
        log.error(f"POST /UPLOADPIC called from host {request.client.host}, error: {str(e)}")

    return response

# ----------------------------------------------------------------------------------------------------------------------

@router.post("/updatepicture/")
async def upload_pic(request: Request, fileID: int = Form(...), file: UploadFile = File(...)):
    log.info(fileID)
    try:
        if adminclient.check_auth():
            log.info(fileID)
            log.info(file.filename) 
            log.info(f"fileID type: {type(fileID)}")
            log.info(f"fileID is None: {fileID is None}")
            log.info(f"file.file type: {type(file.file)}")
            log.info(f"file.file is None: {file.file is None}")
            response = "True"
            adminclient.delete_image(fileID)
            adminclient.upload_image(file.file, fileID)
        else:
            response = "No"
            
    except Exception as e:
        response = "Error"
        log.error(f"POST /UPDATEPIC called from host {request.client.host}, error: {str(e)}")

    return response

# ----------------------------------------------------------------------------------------------------------------------

@router.post("/backupdb/")
async def backup_db(request: Request):
    backupID = ''
    try:
        if adminclient.check_auth(): 
            backupID = adminclient.backup()
            response = "True"
        else:
            response = "No"
    except Exception as e:
        response = "Error"
        log.info(f"POST /BACKUPDB called from host {request.client.host}, error: {str(e)}")
    
    return response, backupID

# ----------------------------------------------------------------------------------------------------------------------

@router.post("/listbackups/")
async def list_backup(request: Request):
    backups = list()
    try:
        if adminclient.check_auth(): 
            response = "True"
            backups = adminclient.get_backups()
        else:
            response = "No"
    except Exception as e:
        log.info(f"POST /LISTBACKUP called from host {request.client.host}, error: {str(e)}")
        response = "Error"
    return response, backups

# ----------------------------------------------------------------------------------------------------------------------

@router.post("/restoredb/")
async def restore_db(adminbackup: adminBackup, request: Request):
    try:
        if adminclient.check_auth(): 
            response = adminclient.restore(adminbackup.backupID)
            response = "True"
        else:
            response = "No"
    except Exception as e:
        log.error(f"POST /RESTOREDB called from host {request.client.host}, error: {str(e)}")
        response = "Error"
    
    return response

# ----------------------------------------------------------------------------------------------------------------------

@router.post("/removebackup/")
async def restore_S3(adminbackup: adminBackup, request: Request):
    try:
        if adminclient.check_auth(): 
            adminclient.removeBack(adminbackup.backupID)
            response = "True"
        else:
            response = "No"
    except Exception as e:
        log.error(f"POST /REMOVEBACKUP called from host {request.client.host}, error: {str(e)}")
        response = "Error"
    
    return response

# ----------------------------------------------------------------------------------------------------------------------
# ----------------------------------------------------------------------------------------------------------------------
# ----------------------------------------------------------------------------------------------------------------------
# ----------------------------------------------------------------------------------------------------------------------
# ----------------------------------------------------------------------------------------------------------------------
# ----------------------------------------------------------------------------------------------------------------------

@router.post("/logout/")
async def logout():
    global adminclient
    global userclient
    global email
    global admin
    try:
        adminclient = AdminClient()
        response = None
    except:
        response = None

    try:
        userclient = FantasyClient()
        response = None
    except:
        response = None

    try:
        admin = ""
        response = None
    except:
        response = None

    try:
        email = ""
        response = None
    except:
        response = None

    return response

# @router.post("/getteam/")
# async def get_team(request: Request):
#     team = []
#     capID = 0
#     all_budg = 0
#     try:
#         if not userclient.get_user_id() == 0: 
#             team, capID, all_budg = userclient.get_team()
#             response = "True"
#         else:
#             response = "No"

#     except Exception as e:
#         log.error(f"POST /GETTEAM from host {request.client.host}, error: {str(e)}")
#         response = "Error"

#     return response, team, capID, all_budg

# # ----------------------------------------------------------------------------------------------------------------------

# @router.post("/getplayers/")
# async def get_team(request: Request):
#     players = []
#     try:
#         if not userclient.get_user_id() == 0: 
#             players = userclient.get_players()
#             response = "True"
#         else:
#             response = "No"

#     except Exception as e:
#         log.error(f"POST /GETPLAYERS from host {request.client.host}, error: {str(e)}")
#         response = "Error"

#     return response, players

# # ----------------------------------------------------------------------------------------------------------------------

# @router.post("/listlead/")
# async def list_leaders(request: Request):
#     leaderboard = []
#     try:
#         if not userclient.get_user_id() == 0: 
#             response = "True"
#             leaderboard  = userclient.leaderboard()
#         else:
#             response = "No"
            

#     except Exception as e:
#         response = "Error"
#         log.error(f"POST /LISTLEADERS called from host {request.client.host}, error: {str(e)}")

#     return response, leaderboard