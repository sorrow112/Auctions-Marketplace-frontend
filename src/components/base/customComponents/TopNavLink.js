import React from "react";
import { styled } from "@mui/system";
import { Link } from "react-router-dom";

export const CustomLink = styled(Link)(({ theme }) => ({
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
  textDecoration: "none",
  padding: 20,
  borderRadius: 10,
  fontSize: 20,
  fontFamily: `"Roboto","Helvetica","Arial",sans-serif`,
  "&:hover": {
    color: theme.palette.secondary.main,
    textDecoration: "underline",
    textUnderlineOffset: 7,
  },
}));
const TopNavLink = ({ text, path }) => {
  return (
    <CustomLink to={path} sx={{ color: "secondary.main" }}>
      {text}
    </CustomLink>
  );
};
export const CategoryLink = styled(Link)(({ theme }) => ({
  textDecoration: "none",
  padding: 5,
  fontSize: 20,
  
  fontFamily: `"Roboto","Helvetica","Arial",sans-serif`,
  "&:hover": {
    color: theme.palette.secondary.main,
    textDecoration: "underline",
    textUnderlineOffset: 7,
  },
}));
export default TopNavLink;
