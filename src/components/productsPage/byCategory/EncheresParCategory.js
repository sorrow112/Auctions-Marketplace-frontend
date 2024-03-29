import { Checkbox, Grid, Pagination, Typography } from '@mui/material';
import React from 'react'
import ProductsListing from '../../generalComponents/ProductsListing';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { apiRoutes, navRoutes } from "../../../config/routes";

const EncheresParCategory = () => {
  const {categoryId} = useParams();
  const [encheres, setEncheres] = React.useState({});
  const [categoryName, setCategoryName] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pagesNumber, setPageNumber] = React.useState(1);
  const [checked, setChecked] = React.useState(false);

  function getPagesNumber() {
    if(checked){
      axios
      .get(`${apiRoutes.API}/encheres/pages`, {
        params: {
          category: categoryId,
        },
      })
      .then((res) => {
        if (res["data"]["hydra:member"].length / 12 < 1) {
          setPageNumber(1);
        } else {
          setPageNumber(Math.ceil(res["data"]["hydra:member"].length / 12));
        }
      });
    }else{axios
      .get(`${apiRoutes.API}/encheres/pages`, {
        params: {
          category: categoryId,
          "endDate[after]": new Date(),
        },
      })
      .then((res) => {
        if (res["data"]["hydra:member"].length / 12 < 1) {
          setPageNumber(1);
        } else {
          setPageNumber(Math.ceil(res["data"]["hydra:member"].length / 12));
        }
      });}
  }
  function getEnchere() {
    axios.get(`${apiRoutes.API}/encheres`, {
      params: {
        page: "1",
        category: `${categoryId}`,
        "endDate[after]": new Date(),
      }
    })
    .then(function (response) {
      console.log(response["data"]["@id"], "retrieved successfully!")
      setEncheres(response["data"]["hydra:member"]);
    }).catch(error=>console.log(error))
  }
  const getCategoryName = ()=>{
    axios.get(`${apiRoutes.API}/categories/${categoryId}`).then(response=>{setCategoryName(response["data"].name)}).catch(error=>{return error})
  }
  const handlePagination = (event, value) => {
    setPage(value);
  };
  const handleCheck = (event) => {
    setChecked(event.target.checked);
  };
  React.useEffect(()=>{
    getEnchere()
    getCategoryName()
    getPagesNumber();
  },[])
  React.useEffect(() => {
    getEnchere();
  }, [page, checked]);

      return (
        <Grid container>
           <Grid container>
        <Grid item xs={7}>
          <Typography variant="h3" ml="2%">
            Nos enchères de  catégorie {categoryName}
          </Typography>
        </Grid>
        <Grid item sx = {{mt:1}} >
          <Checkbox
            checked={checked}
            onChange={handleCheck}
            inputProps={{ "aria-label": "controlled" }}
          />
          
        </Grid>
        <Grid item xs={3}><br /><Typography>afficher les encheres Inversées expirés</Typography></Grid>
      </Grid>
            <ProductsListing elemsPerLine={6} type={navRoutes.ENCHERE} ventes={encheres}>
            </ProductsListing>
            <Pagination
        count={pagesNumber}
        onChange={handlePagination}
        color="secondary"
      />
        </Grid>
      )
}

export default EncheresParCategory