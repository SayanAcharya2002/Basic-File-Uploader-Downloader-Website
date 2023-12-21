//authentication function for all the requests
const jwt=require('jsonwebtoken');
const {get_accounts,save_accounts}=require('./account_handler');



function auth_func(req,res,next){
  let accounts=get_accounts();
  if(req.cookies.jwt){
    jwt.verify(req.cookies.jwt,'whassup',(err,vertoken)=>{
      if(err){
        console.log(err);
        res.redirect('/front');
      }else{
        req.email=vertoken.email;
        req.is_manager=accounts[req.email].is_manager;
        next();
      }
    })
  }else{
    res.redirect('/front');
  }
  
  
}

function manager_auth(req,res,next){
  if(!req.is_manager){
    res.status(400).send(`Forbidden access. ${req.email} is not manager!`);
  }else{
    next();
  }
}

module.exports={
  auth_func,manager_auth
}