import { Box, Divider, Typography } from "@mui/material";
import React from "react";
import { lightContainer } from "../base/customComponents/general";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import API from "../../AxiosInstance";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CustomLink } from "../base/customComponents/TopNavLink";

function createData(id,route,title, description, date) {
  return { id,route,title, description, date };
}



const NotificationListing = () => {
    const [notifications, setNotifications] = React.useState([])
    const [loadedPage, setLoadedPage] = React.useState(1)
    const myUser = useSelector((state) => state.user);
    const navigate = useNavigate();


    function getNotification(){
        console.log(loadedPage)
        API.get(`/notificationTable`,{
            params:{
                page:loadedPage,
                user: `/api/users/${myUser.id}`,
                "order[date]": "desc"
            }
        }).then(res=>{
            console.log(res)
            fill(res["data"]["hydra:member"]);
        }).catch(err=>console.log(err))
    }


    const fill = (res)=>{
        let rows = [];
        if(notifications[0]){
            rows.push(...notifications)
        }

        res.forEach(notification=>{
            rows.push(createData(notification.id,notification.route,notification.title, notification.description, notification.date),)
        })
        setNotifications(rows)
        console.log(rows)
    }


    const handleAddMore = ()=>{
        setLoadedPage(loadedPage +1);
    }
    React.useEffect(()=>{
        getNotification()
    },[myUser, loadedPage])
  return (
    <Box sx={lightContainer}>
        <Typography variant="h4" > Vos notifications</Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>titre</TableCell>
              <TableCell align="right">description&nbsp;</TableCell>
              <TableCell align="right">date&nbsp;</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notifications.map((notification) => (
              <TableRow
                key={notification.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  <CustomLink to={`${notification.route}`}>{notification.title}</CustomLink>
                </TableCell>
                <TableCell align="right">{notification.description}</TableCell>
                <TableCell align="right">{notification.date}</TableCell>
              </TableRow>
            ))}


                

          </TableBody>
          
        </Table>
        {notifications.length === loadedPage*15 && <div> <Divider/>
        <Typography onClick={handleAddMore} sx={{textAlign:"center", fontSize:20,margin:"10px 0"}}>afficher plus de notifications</Typography></div>}
        
      </TableContainer>
    </Box>
  );
};

export default NotificationListing;
