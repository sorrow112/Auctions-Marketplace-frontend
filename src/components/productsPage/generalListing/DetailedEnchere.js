import {
  Grid,
  Typography,
  Button,
  TextField,
  DialogContentText,
  DialogContent,
  Dialog,
  DialogActions,
  DialogTitle,
  Container,
  Divider,
  TableCell,
  TableRow,
  TableBody,
  TableContainer,
  Paper,
  Table,
  TableHead,
} from "@mui/material";
import { Box } from "@mui/system";
import React, { useRef } from "react";
import PersonIcon from "@mui/icons-material/Person";
import {
  ButtonStyles,
  lightContainer,
  ArticleImage,
  ArticleSubImage,
  pinkish,
} from "../../base/customComponents/general";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { apiRoutes, navRoutes } from "../../../config/routes";
import Api from "../../../AxiosInstance";
import { useDispatch, useSelector } from "react-redux";
import Socket from "../../base/customComponents/Socket";
import { fetchWatchList } from "../../../redux/actions";
import placeHolder from "../../../media/images/imagelessAuction.png"
import Countdown from "../../base/customComponents/Countdown";
import { CategoryLink } from "../../base/customComponents/TopNavLink";

function createData(id,userId,user, telephone, montant, date) {
  return { id,userId,user, telephone, montant, date };
}

const DetailedEnchere = () => {
  const dispatch = useDispatch();
  //GET DATA FROM STORE/PARAMS
  const watchList = useSelector((state) => state.watchList);
  const thePrice = useSelector((state) => state.currentPrice);
  const user = useSelector((state) => state.user);
  let { id } = useParams();

  //#region states
  const [enchere, setEnchere] = React.useState({});
  const [isOwner, setIsOwner] = React.useState(false);
  const [article, setArticle] = React.useState({});
  const [description, setDescription] = React.useState("");
  const [followable, setFollowable] = React.useState(true);
  const [seller, setSeller] = React.useState({});
  const [images, setImages] = React.useState([]);
  const [watched, setWatched] = React.useState(false);
  const [augmentation, setAugmentation] = React.useState(0.1);
  const [watchButton, setWatchButton] = React.useState("surveiller");
  const [live, setLive] = React.useState(false);
  const [expired, setExpired] = React.useState(false);


  //#endregion

  const [augmentations, setAugmentations] = React.useState([])
  const [loadedPage, setLoadedPage] = React.useState(1)
  const navigate = useNavigate();


  function getAugmentations(){
      console.log(loadedPage)
      Api.get(`/augmentationsTable`,{
          params:{
              page:loadedPage,
              enchereInverse: `/api/encheres/${id}`,
              "order[date]": "desc"
          }
      }).then(res=>{
          console.log(res)
          fill(res["data"]["hydra:member"]);
      }).catch(err=>console.log(err))
  }


  const fill = (res)=>{
      let rows = [];
      if(augmentations[0]){
          rows.push(...augmentations)
      }

      res.forEach(augmentation=>{
          rows.push(createData(augmentation.id,augmentation.user.id,augmentation.user.displayName,augmentation.user.telephone
              , augmentation.value,augmentation.date),)
      })
      setAugmentations(rows)
      console.log(rows)
  }


  const handleAddMore = ()=>{
      setLoadedPage(loadedPage +1);
  }
  React.useEffect(()=>{
      getAugmentations()
  },[loadedPage])
  //#region state handlers
  const handleAugmentation = (event) => {
    setAugmentation(parseFloat(event.target.value));
  };
  //#endregion
  //REMOVES SUBSCRIPTION TO SOCKET ROOM IF NOT WATCHED
  const mounted = useRef(false);
  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      Socket.emit("leave-room", `/api/encheres/${id}`);
    };
  }, []);
const styles={
  counterBox:{backgroundColor:"primary.main",  width:"25%", mr:"auto", ml:"auto"}
}
  //socket code
  Socket.on("connect", () => {
    console.log(`you're connected to Socket.io from product`);
    // Socket.on("NOTIFICATION", (notification) => {
    //   console.log(notification)
    // });
    Socket.on("NEW_PRICE", (myEnchere, user, newPrice, initPrice) => {
      dispatch({ type: "SETPRICE", newPrice });
      getCurrentPrice(initPrice, id);
      // alert(`${user} has updated the price of ${myEnchere} to ${newPrice}`);
    });
  });


  //gets the value given in the latest augmentation
  function getCurrentPrice(initPrice, myId) {
    axios
      .get(`${apiRoutes.API}/augmentationHighest`, {
        params: {
          page: 1,
          enchere: `/api/encheres/${myId}`,
          "order[date]": "desc",
        },
      })
      .then((response) => {
        //sets the result (augmentation) in the state
        if (response["data"]["hydra:member"]["0"] !== undefined) {
          dispatch({
            type: "SETPRICE",
            price: response["data"]["hydra:member"]["0"].value,
          });
        } else {
          dispatch({ type: "SETPRICE", price: initPrice });
        }
      })
      .catch((error) => console.log(error));
  }

  //gets the actual enchere
  function getEnchere() {
    axios
      .get(`${apiRoutes.API}/encheres/${id}`)
      .then(function (response) {
        const data = response["data"];
        console.log(response["data"]["@id"], "retrieved successfully!");
        if(new Date(response["data"].endDate).getTime() < new Date().getTime()){
          setLive(false);
          setExpired(true);

        }else if(new Date(response["data"].startDate).getTime() < new Date().getTime()){
          setLive(true);
          setExpired(false);

        }else{
          setLive(false);
          setExpired(false);

        }
        setEnchere(data);
        //gets the current augmentation from the latest augmentation
        getCurrentPrice(response["data"].initPrice, id);
        //sets seller details
        console.log(data.user.adresse[0].ville)
        setSeller({
          id:data.user.id,
          ["nom d'utilisateur"]: data.user.displayName,
          localisation: data.user.adresse[0].ville,
        });

        Socket.emit("join-rooms", [response["data"]["@id"].concat("LOCAL")]);
        //get the article
        //TODO: docs could be fetched with article , play with groups
        axios
          .get(`${apiRoutes.API}/articles/${response["data"]["article"]["id"]}`)
          .then(function (response) {
            const data = response["data"];
            axios
              .get(`${apiRoutes.API}/documents`, {
                params: {
                  page: 1,
                  article: response["data"]["@id"],
                },
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              })
              .then((response) => {
                getImages(response["data"]["hydra:member"]);
              })
              .catch((error) => console.log(error));
            setArticle({
              Nom: data.name,
              ["Etat"]: data.state,
              Localisation: data.localisation,
              Marque: data.brand,
              ["Code a barre"]: data.codebar,
              ["Date de fabrication"]: data.fabrication_date.substring(0, 10),
            });
            setDescription(data.description);
          })
          .catch((error) => console.log(error));
      })
      .catch((error) => console.log(error));
  }
  const checkWatched = ()=>{
    if(user!=={}){
      Api.get(`/surveilles`,{
        params:{
          user:`/api/users/${user.id}`,
          enchere:`/api/encheres/${id}`
        }
      }).then(res=>{
        console.log(res["data"]["hydra:member"])
        if(res["data"]["hydra:member"]!==[])
        {
          setWatched(true)
          setWatchButton("unsurveiller")
        }else{
          setWatched(false)
          setWatchButton("surveiller")
        }
      })
    }
  }
  const handleWatch = ()=>{
    if(watched=== false && user!=={}){
      Api.post("/surveilles",{
        user: `/api/users/${user.id}`,
        enchere: `/api/encheres/${enchere.id}`
      }).then(response=>{
        console.log(response["data"]["@id"]+ " created")
        dispatch(fetchWatchList(user.id))
        setWatched(true)
        setWatchButton("unsurveiller")
        
      }).catch(err=>console.log("oops something went wrong"))
    }else if(watched === true){
      const surveille =watchList.filter(e=>e.enchereInverse===`/api/enchere/${id}`);
      Api.delete(surveille.surveille).then(res=>console.log("successfully unwatched")).catch(err=>console.log("smtng went wrong"))
      setWatched(false)
      setWatchButton("surveiller")
  }
  }
  //#region augmentation zone
  function augmenter() {
    const newPrice = Math.round((thePrice + augmentation) * 100) / 100;

    Api.post("/augmenter", {
      user: `/api/users/${user.id}`,
      enchere: `/api/encheres/${id}`,
      value: newPrice,
      date: new Date(),
    })
      .then((response) => {
        console.log(response["data"]["@id"], "created successfully!");
        getCurrentPrice(enchere.initPrice, id);
        Socket.emit(
          "AUGMENT",
          enchere["@id"],
          user.displayName,
          newPrice,
          1
        );
      })
      .catch((error) => console.log(error));
  }
  //#endregion

  //MAKES IMAGES READY FOR USE
  const getImages = (rawImages) => {
    let tempImages = [];
    let path = "http://127.0.0.1:8000";
    rawImages.map((image) => {
      const myImg = path.concat(image.contentUrl);
      tempImages.push(myImg);
      console.log(myImg);
    });
    setImages(tempImages);
    console.log(tempImages);
  };
  //#region concerning verification popup
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  //#endregion

  //#region handle fermeture
  const handleFermeture = ()=>{
    //TODO: the case of no one augmenting
    axios
      .get(`${apiRoutes.API}/augmentationHighest`, {
        params: {
          page: 1,
          enchere: `/api/encheres/${id}`,
          "order[date]": "desc",
        },
      }).then(res=>{
        Api.post(`${apiRoutes.API}/fermetures`,{
        user:res["data"]["hydra:member"]["0"].user,
        date: new Date().getTime(),
        isSold: true,
        finalPrice:res["data"]["hydra:member"]["0"].value,
        enchere: `/api/encheres/${id}`
      }).then(res=>console.log("fermeture created , please redirect user"))})
    
  }
  //#endregion

  React.useEffect(() => {
    checkWatched();
    getEnchere();
  }, [id, mounted]);
  React.useEffect(() => {
    if(user==={}||user.id === seller.id||expired===true){
      setFollowable(false)
    }else{
      setFollowable(true)
    }
    if(user.id === seller.id){
      setIsOwner(true)
      console.log(isOwner)
    }else{
      setIsOwner(false)
      console.log(isOwner)
    }
  }, [seller,user]);

  return (
    <Grid container sx={{...pinkish, mt:5}}>
      {/* could be used for anything */}
      {/* this is just a verification popUp */}
      {user.id === seller.id ?(
        <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">les augmentations</DialogTitle>
        <DialogContent>

      <TableContainer component={Paper}>
        <Table   aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>transmetteur </TableCell>
              <TableCell align="right">Enchère proposé&nbsp;</TableCell>
              <TableCell align="right">Date&nbsp;</TableCell>
              <TableCell align="right">actions&nbsp;</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {augmentations.map((augmentation) => (
              <TableRow
                key={augmentation.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell scope="row">
                  <CategoryLink to={`${navRoutes.CONSULTUSER}/${augmentation.userId}`}>{augmentation.user}</CategoryLink>
                </TableCell>
                <TableCell align="right">{augmentation.montant}</TableCell>
                <TableCell align="right">{augmentation.date.slice(0,10)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {augmentations.length === loadedPage*15 && <div> <Divider/>
        <Typography onClick={handleAddMore} sx={{textAlign:"center", fontSize:20,margin:"10px 0"}}>afficher plus de notifications</Typography></div>}
        
      </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button
            sx={ButtonStyles}
            onClick={() => {
              handleClose();
              setAugmentations([])
            }}
          >
            Fermer
          </Button>

        </DialogActions>
      </Dialog>

      ):(
        <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">vérification</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
          Est ce que vous êtes sur ? cette augmentation est permenante et changer l'avis n'est pas possible.
            une augmentation faussive peut resulter dans des pénalités.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            sx={ButtonStyles}
            onClick={() => {
              handleClose();
            }}
          >
            Refuser
          </Button>
          <Button
            sx={ButtonStyles}
            onClick={() => {
              augmenter();
              handleClose();
            }}
            autoFocus
          >
            Accepter
          </Button>
        </DialogActions>
      </Dialog>

      )}
      <Grid item xs={2}></Grid>

      <Grid
        container
        sx={
        pinkish
      }
        spacing={2}
      ><Grid item xs={12} sx={{mb:3 , }}>
                <Box sx={styles.counterBox}>
        {live===true &&(<Typography sx={{textAlign:"center", mt:2}} variant="h3">live</Typography>)}
      <Countdown variant="h4" endDate={enchere.endDate} startDate={enchere.startDate}/>
      </Box>
      </Grid>
        

        {/* first section */}
        <Grid item xs={5.8} >
        <Grid item ml={4}>
        {followable === true &&
          <Grid item><Button onClick={handleWatch} sx={{...ButtonStyles, backgroundColor:"primary.main"}}> {watchButton} </Button></Grid>}
        {isOwner === true &&
          <Grid item><Button onClick={handleFermeture} sx={{...ButtonStyles, backgroundColor:"primary.main"}}> fermer </Button></Grid>}
          </Grid>
          {/* documents */}

          

          <Grid item>
            <ArticleImage src={images[0]} alt="" />
          </Grid>
          <Grid container sx={{ml:3}} spacing={2}>
            {images.map((image) => (
              <Grid item xs={4} key={Math.random()} sx={{ height: 100 }}>
                <ArticleSubImage src={image} alt={image} />
              </Grid>
            ))}
            {images[0]===undefined && <ArticleImage src={placeHolder} alt="" />}
          </Grid>
          {/* seller userdata subsection */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {/* title */}
            <Grid item xs={12} sx={lightContainer}>
              <Typography variant="h3">
                <PersonIcon fontSize="large" sx={{ mr: 2 }} />
                le vendeur
              </Typography>
              {/* seller data details */}
              <Grid item sx={{ mt: 2 }}>

                  <Grid container sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="h6">nom d'utilisateur: </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h6">{seller["nom d'utilisateur"]} </Typography>
                    </Grid>
                  </Grid>
                  <Grid container sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="h6">localisation: </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h6">{seller.localisation} </Typography>
                    </Grid>
                  </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        
        <Grid item xs={0.4}></Grid>
        {/* second section */}
        
        <Grid item xs={5.8} sx={{ color: "secondary.main" }}>

        <Typography sx={{ml:5}} variant="h3" color={"black"}>
            {article.nom}
          </Typography>

        {live===true ? (<Box sx={lightContainer}>
          <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="h6">encherir:</Typography>{" "}
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h6">
                  prix actuel: {thePrice}TND
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h8">
                  prix apres l'augmentation: {thePrice + augmentation} TND
                </Typography>
              </Grid>
              <Grid item xs={4}></Grid>
              <Grid item xs={4}>
                <TextField
                  required
                  type="number"
                  id="augmentation"
                  label="augmentation"
                  value={augmentation}
                  onChange={handleAugmentation}
                />
              </Grid>

              <Grid item xs={4}>
              {isOwner === true ? (<Button sx={ButtonStyles} onClick={()=>
              {
                handleClickOpen()
                getAugmentations()
              }
              }>les augmentations</Button>):(<Button sx={ButtonStyles} onClick={handleClickOpen}>
                {" "}
                encherir
              </Button>)}
                
              </Grid>
            </Grid>
          </Box>):(<></>)}
          {/* selling section */}
          
          {/* sale details section*/}
          <Box>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              {/* title */}
              <Grid
                item
                xs={12}
                sx={lightContainer}
              >
                <Typography variant="h3">
                  <PersonIcon fontSize="large" sx={{ mr: 2 }} />
                  details sur produit
                </Typography>
                {/* article details section */}
                <Grid item sx={{ mt: 2 }}>
                  {Object.keys(article).map((key, index) => (
                    <Grid container key={index} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Typography variant="h6">{key}: </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="h6">{article[key]} </Typography>
                      </Grid>
                    </Grid>
                  ))}
                  {/* TODO: GIVE DESCRIPTION A SEPERATED SECTION */}
                  <Grid container sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Typography variant="h6">description: </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="h6">{description} </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default DetailedEnchere;