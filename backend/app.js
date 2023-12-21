const auxil=require('./auxil');
const { urlencoded } = require('body-parser');
const express=require('express');
const path=require('path');
const os=require('os');
const jwt=require('jsonwebtoken');
const cookie_parser=require('cookie-parser');
const file_upload=require('express-fileupload');
const fs=require('fs');
const {get_accounts,save_accounts}=require('./account_handler');

const app=express()
const accounts=get_accounts()
const static_path=path.resolve(__dirname,'../static/')
const account_path=path.resolve(__dirname,'../static/accounts/')

app.set('view engine','ejs');

app.use([
  cookie_parser(),
  urlencoded({extended:true}),
  express.json(),
  express.static(static_path),
  file_upload({
    limits: { fileSize: 50 * 1024 * 1024 },
  }),
])

app.use('/display',express.static(static_path));
app.use('/display_all',express.static(static_path));
// app.use('/upload',express.static(static_path));
// app.use('/upload_all',express.static(static_path));

app.post('/login',(req,res)=>{
  let {email,password}=req.body;
  // console.log(req.body);
    if(accounts.hasOwnProperty(email) && (password===accounts[email].password)){
      //send jwt cookie
      tok=jwt.sign({email},"whassup");
      res.cookie('jwt',tok,{maxAge:10*60*1000});
      res.json({ok:true});    
    }else{
      res.json({error:'something went wrong',ok:false});
    }
})

app.post('/signup',(req,res)=>{
  let {email,password}=req.body;
    if(accounts.hasOwnProperty(email)){
      res.json({error:'user already exists',ok:false});
    }else{
      accounts[`${email}`]={password:password,is_manager:false};
      target_dir=account_path+`/${email}`
      if(!fs.existsSync(target_dir)){
        fs.mkdirSync(target_dir);
      }
      save_accounts(accounts);

      //send jwt cookie
      tok=jwt.sign({email},"whassup");
      res.cookie('jwt',tok,{maxAge:10*60*1000});
      res.json({ok:true}); 
    }
})

app.get('/login',(req,res)=>{
  // res.render(path.resolve(__dirname,'../static/login.ejs'))
  res.render('../static/login/login.ejs');

})

app.get('/front',(req,res)=>{
  res.render('../static/front/front.ejs');
})

app.get('/signup',(req,res)=>{
  // res.render(path.resolve(__dirname,'../static/login.ejs'))
  res.render('../static/signup/signup.ejs');

})

app.get('/logout',(req,res)=>{
  tok="";
  res.cookie('jwt','',{maxAge:1});
  res.redirect('/front');
});

app.use(auxil.auth_func);

app.get('/home',(req,res)=>{
  res.render('../static/home/home.ejs',{name:req.email,is_manager:req.is_manager});

})

app.get('/display',(req,res)=>{
  target_dir=account_path+`/${req.email}`;
  dict={}
  files=fs.readdirSync(target_dir);
  
  files.forEach(file=>{
    dict[file]=`accounts\\${req.email}\\${file}`;
  });
  res.render('../static/display/display.ejs',{dict,is_manager:req.is_manager});
})

app.get('/upload',(req,res)=>{
  res.render('../static/upload/upload.ejs',{file_name:null,is_manager:req.is_manager});

})

app.get('/delete_all/:email/:filename',auxil.manager_auth,(req,res)=>{
  let {email,filename}=req.params;

  target_dir=account_path+`\\${email}`;
  file_path=target_dir+`\\${filename}`;
  // console.log("deleting:",file_path);
  
  if(fs.existsSync(file_path)){
    fs.unlinkSync(file_path);
    res.json({ok:true});
  }else{
    res.json({ok:false});
  }
});

app.get('/download_all/:email/:filename',auxil.manager_auth,(req,res)=>{
  let {email,filename}=req.params;

  let target_dir=account_path+`\\${email}`;
  let file_path=target_dir+`\\${filename}`;
  // console.log(file_path);
  
  if(fs.existsSync(file_path)){
    res.download(file_path);
  }else{
    
  }
});

app.get('/display_all',auxil.manager_auth,(req,res)=>{
  let q=req.query;
  let email=q.input;
  let dict={};
  console.log(email);
  if(email){
    target_dir=account_path+`\\${email}`;
    files=fs.readdirSync(target_dir);
    
    files.forEach(file=>{
      dict[file]=`accounts\\${email}\\${file}`;
    });
  }
  console.log(dict)
  res.render('../static/display_all/display_all.ejs',{is_manager:req.is_manager,dict,whom:email});

});

app.get('/upload_all',auxil.manager_auth,(req,res)=>{
  res.render('../static/upload_all/upload_all.ejs',{is_manager:req.is_manager,dict:{},msg:""});

});

app.get('/delete/:file_name',(req,res)=>{
  target_dir=account_path+`\\${req.email}`;
  file_name=req.params['file_name'];
  file_path=target_dir+`\\${file_name}`;
  // console.log("deleting:",file_path);
  
  if(fs.existsSync(file_path)){
    fs.unlinkSync(file_path);
    res.json({ok:true});
  }else{
    res.json({ok:false});
  }

})

app.get('/download/:file_name',(req,res)=>{
  target_dir=account_path+`\\${req.email}`;
  file_name=req.params['file_name'];
  file_path=target_dir+`\\${file_name}`;
  // console.log(file_path);
  
  if(fs.existsSync(file_path)){
    res.download(file_path);
  }else{
    
  }

});

app.post('/upload',(req,res)=>{
  console.log(req.files);
  target_dir=account_path+`/${req.email}`
  if(!fs.existsSync(target_dir)){
    fs.mkdirSync(target_dir);
  }

  // res.json({ok:true})
  fs.writeFileSync(target_dir+`/${req.files.file.name}`,req.files.file.data);
  res.render('../static/upload/upload.ejs',{file_name:req.files.file.name,is_manager:req.is_manager});
})

app.post('/upload_all',auxil.manager_auth,(req,res)=>{
  // console.log(req.body)
  let email=req.body.username;
  // console.log(req.files);
  target_dir=account_path+`/${email}`
  if(!fs.existsSync(target_dir)){
    fs.mkdirSync(target_dir);
  }

  // res.json({ok:true})
  fs.writeFileSync(target_dir+`/${req.files.file.name}`,req.files.file.data);
  res.render('../static/upload_all/upload_all.ejs',{file_name:req.files.file.name,is_manager:req.is_manager,msg:`${req.files.file.name} uploaded successfully for ${email}`});
})

app.listen(5000,(req,res)=>{
  console.log('listening on 5000....');
})