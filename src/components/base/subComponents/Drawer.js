import React from "react";
import {
  Drawer,
  Divider,
  IconButton,
  List,
  ListItemIcon,
  ListItemText,
  ListItem,
  Box,
  Typography,
} from "@mui/material";
import { DrawerHeader } from "../customComponents/general";
import { ChevronLeft } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { navRoutes } from "../../../config/routes";

const styles = {
  drawer: {
    width: "25%",
    flexShrink: 0,
    "& .MuiDrawer-paper": {
      width: "25%",
      boxSizing: "border-box",
    },
  },
  item: {
    "&:hover": {
      backgroundColor: "secondary.main",
      color: "primary.main",
    },
  },
};

const MyDrawer = ({ open, setOpen }) => {
  const user = useSelector((state) => state.user);

  const listeElems1 = {
    "tous les encheres": navRoutes.ENCHERES,
    "nos enchères inversées": navRoutes.ENCHERESINVERSES,
    categories: navRoutes.CATEGORIES,
  };

  let listeElems2 = {};
  if (user.id === undefined) {
    listeElems2 = {
      "créer un compte": navRoutes.REGISTER,
      "se connecter": navRoutes.LOGIN,
    };
  } else {
    listeElems2 = {
      "commancer un enchère ou enchere inversé": navRoutes.MAKE_ARTICLE,
      "votre profile": navRoutes.USERPROFILE,
      "liste de surveilles": navRoutes.WATCHLIST,
      "vos Encheres": `${navRoutes.ENCHERES}${navRoutes.PERUSER}/${user.id}`,
      "vos Encheres Inversés": `${navRoutes.ENCHERESINVERSES}${navRoutes.PERUSER}/${user.id}`,
      "les demandes de devis recus": navRoutes.DEMANDESLISTING,
      "les propositions recus": navRoutes.PROPOSITIONSLISTING,
      "se déconnecter": navRoutes.LOGOUT,
    };
  }

  const handleDrawerClose = () => {
    setOpen(false);
  };
  const navigate = useNavigate();

  return (
    <Drawer sx={styles.drawer} variant="persistent" anchor="left" open={open}>
      <DrawerHeader>
      <Typography variant="h4">menu</Typography>
        <IconButton onClick={handleDrawerClose}>
          
          <ChevronLeft />
        </IconButton>
      </DrawerHeader>

      <Divider />
      <List>
        {Object.keys(listeElems1).map((key, index) => (
          <ListItem
            sx={styles.item}
            button
            key={index}
            onClick={() => navigate(listeElems1[key])}
            id={listeElems1[key]}
          >
            <ListItemText primary={key} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {Object.keys(listeElems2).map((key, index) => (
          <ListItem
            sx={styles.item}
            button
            key={index}
            onClick={() => navigate(listeElems2[key])}
            id={listeElems2[key]}
          >
            <ListItemText primary={key} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default MyDrawer;
