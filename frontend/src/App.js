import React from "react";
import { useRoutes } from 'react-router-dom';

// ##########################################################################################

import Home from './pages/Enter/Home';
import Create from './pages/Enter/Create';
import Forgot from './pages/Enter/Forgot';

// ##########################################################################################

import Admin from './pages/Admin/Admin_Home';
import AdminManageDB from "./pages/Admin/Admin_ManageDB";

import AdminGames from './pages/Admin/Admin_Games';
import AdminGameOverview from './pages/Admin/Admin_GameOverview';
import AdminAddGame from './pages/Admin/Admin_AddGame';
import AdminSocials from './pages/Admin/Admin_Socials';
import AdminSocialOverview from './pages/Admin/Admin_SocialOverview';
import AdminAddSocial from './pages/Admin/Admin_AddSocial';

import AdminUsers from './pages/Admin/Admin_Users'
import AdminAddPlayer from './pages/Admin/Admin_AddPlayer'

// ##########################################################################################

import User from './pages/Users/Users_Home';
import UserChangePass from './pages/Users/Users_ChangePass'
import UserRules from './pages/Users/Users_Rules'

import UserGameOverview from './pages/Users/Users_GameOverview'
import UserGames from './pages/Users/Users_Games'
import UserSocialOverview from './pages/Users/Users_SocialOverview'
import UserSocials from './pages/Users/Users_Socials'
import UserPlayerOverview from './pages/Users/Users_PlayerOverview'
import UserPlayers from './pages/Users/Users_Players'

// ##########################################################################################

export default function App() {
  
  let routes = useRoutes([
    { path: '/', element: <Home /> },
    { path: '/create-account', element: <Create /> },
    { path: '/forgot-password', element: <Forgot /> },

    // ##########################################################################################

    { path: '/users', element: <User /> },
    { path: '/users/change-password', element: <UserChangePass /> },
    { path: '/users/rules', element:<UserRules /> },

    { path: '/users/games', element:<UserGames /> },
    { path: '/users/games/:gameID', element:<UserGameOverview /> },

    { path: '/users/socials', element:<UserSocials /> },
    { path: '/users/socials/:socialID', element:<UserSocialOverview /> },

    { path: '/users/players', element:<UserPlayers /> },
    { path: '/users/players/:playerID', element:<UserPlayerOverview /> },

// // ##########################################################################################

    { path: '/admin', element: <Admin /> },
    { path: '/admin/managedb', element: <AdminManageDB /> },

    { path: '/admin/users', element: <AdminUsers /> },
    { path: '/admin/add-player', element: <AdminAddPlayer /> },

    { path: '/admin/games', element:<AdminGames /> },
    { path: '/admin/games/:gameID', element:<AdminGameOverview /> },
    { path: '/admin/games/addgame', element:<AdminAddGame /> },

    { path: '/admin/socials', element:<AdminSocials /> },
    { path: '/admin/socials/:socialID', element:<AdminSocialOverview /> },
    { path: '/admin/socials/addsocial', element:<AdminAddSocial /> }

  ]);
  return routes
}