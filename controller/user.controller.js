const c = require('../server.js');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const jwtKey='secretk3y';

// Get all beats
exports.allBeats = async (req, res) => {
    try {
        let a = await c.query('select * from beats')
        return res.json({
            msg: a
        })
    } catch (e) {
        return res.json({
            msg: 'Error Users Not Found!!!!'
        })
    }
}

// Register Users
exports.register = async (req, res) => {
    const today = new Date()
    var userData = {
        name: req.body.name,
        email: req.body.email,
        hash: req.body.password,
        createdAt: today
    }
    try {
        let sql = await c.query("select id from users where email= '" + userData.email + "'")
            if (sql.length == 0 || sql == null) {
            userData.hash = await bcrypt.hash(userData.hash, 10)
            let inserting = await c.query('insert into users set ?', userData)
            return res.status(201).json({
                err: false,
                msg: 'User Inserted'
            })
        } else {
            return res.status(400).json({
                err: true,
                msg: 'User Already exist',
                data: {}
            })
        }
    } catch (e) {
        return res.status(400).json({
            err: true,
            msg: e,
            data: {}
        })
    }
}
    //Login
    exports.login = async (req, res) => {
        try{
            let sql = await c.query("select * from users where email='"+ req.body.email +"'")
            console.log(sql)
            if(sql.length==0 || sql==null){
                return res.status(400).json({
                    err:true,
                    msg:'Sorry Invalid Password / User Not Found',
                    data:{}
                })
            }
            else{
              //  console.log(req.body.password)
             //   console.log(sql[0].hash)
                if  (bcrypt.compareSync(req.body.password, sql[0].hash)) {
                    const payload = {
                      id: sql[0].id,
                      name: sql[0].name,
                      email: sql[0].email
                    }
                   // console.log(payload)
                    let token = jwt.sign(payload, jwtKey, {
                        expiresIn: 1440
                      })
                     // console.log(token)
                      res.status(200).json({
                          err:'false',
                          msg:'Login Sucessfull',
                          data:{token:token}
                      })            

            }
            else
            {       return res.status(400).json({
                    err:true,
                    msg:'Sorry Invalid Password / User Not Found',
                    data:{}
                })
            }
        }
    }
        catch (e) {
            return res.status(400).json({
                err: true,
                msg: e,
                data: {error:e}
            })
        }
}

// Add Beats
exports.addBeats = async  (req, res) => {
   /**/
    const beat={
        uid:(jwt.verify(auth_id, jwtKey)).id,
        beat:req.body.beat,
        createdAt:Date
    }
    try{
    let sql = await c.query('insert into beats set ?',beat)
    return res.status(201).json({
        err: false,
        msg: 'Beat Posted',
        data:{}
    })}
    catch(e)
    {
        return res.status(500).json({
            err:true,
            msg:'Internal Server Error',
            data:{}
        })
    }
}  
//Search User
exports.findByName = async (req, res) => {
    if(!req.params.find)
    {
      return res.status(400).json({
        data:{},
        err:
        true,
        msg:'Enter Keyword For Search'
      });
    }
    let find= req.params.find;
    let sql = await(c.query("select * from user where name ='"+ find +"'"))
    if(sql.length<=0 || sql.length==null)
    {
        return res.data.status(400).json({
            data:{},
            err:'Not Found!!!',
            msg:'Sorry No Users Found With Matching Cases'
        })
    }
    else{
        return res.data.status(200).json({
            data:'',
            err:'',
            msg:sql
        })
    }
} 
//Follow || Unfollow
exports.follow = async  (req, res) => {
 let id = req.params.id
 uid=(jwt.verify(auth_id, jwtKey)).id
 let sts= await c.query("select * from followers where uid ='"+ uid +"'and follows_id='"+ id  +"'")
 if (sts.length<=0||sts==null)
 {
     try{
         let flw = await c.query("insert into followers values '"+ uid +"','"+ id +"'") 
         return res.data.status(200).json({
            data:'',
            err:'false',
            msg:'Following User'
        })
     }
     catch(e){
         return res.data.status(400).json({
             data:'',
             err:'True',
             msg:e
         })
     }
 }
 else{
    try{
        let unflw = await c.query("delete from followers where uid ='"+ uid+"' and follows_id='"+ id +"'") 
        return res.data.status(200).json({
           data:'',
           err:'false',
           msg:'Unfollowing User'
       })
    }
    catch(e){
        return res.data.status(400).json({
            data:'',
            err:'True',
            msg:e
        })
    }
 }
}
//Like||Dislike
exports.like = async  (req, res) => {
    let bid = req.params.bid
    let uid=(jwt.verify(auth_id, jwtKey)).id
    let sts= await c.query("select * from status where uid ='"+ uid +"'and beats_id='"+ bid  +"'")
    if (sts.length<=0||sts==null)
    {
        try{
            let flw = await c.query("insert into status values '"+ bid +"',' like ','"+ Date.now +"','"+ uid +"'") 
            return res.data.status(200).json({
               data:'',
               err:'false',
               msg:'Liked'
           })
        }
        catch(e){
            return res.data.status(400).json({
                data:'',
                err:'True',
                msg:e
            })
        }
    }
    else{
        try{
            let flw = await c.query("delete from status where beats_id ='"+ bid+"'and uid='"+uid+"' and sts='like'") 
            return res.data.status(200).json({
               data:'',
               err:'false',
               msg:'Like Removed'
           })
        }
        catch(e){
            return res.data.status(400).json({
                data:'',
                err:'True',
                msg:e
            })
        } 
    }
}
//Dislike
exports.like = async  (req, res) => {
    let bid = req.params.bid
    let uid=(jwt.verify(auth_id, jwtKey)).id
    let sts= await c.query("select * from status where uid ='"+ uid +"'and beats_id='"+ bid  +"'")
    if (sts.length<=0||sts==null)
    {
        try{
            let flw = await c.query("insert into status values '"+ bid +"',' dislike ','"+ Date.now +"','"+ uid +"'") 
            return res.data.status(200).json({
               data:'',
               err:'false',
               msg:'Disliked'
           })
        }
        catch(e){
            return res.data.status(400).json({
                data:'',
                err:'True',
                msg:e
            })
        }
    }
    else{
        try{
            let flw = await c.query("delete from status where beats_id ='"+ bid+"'and uid='"+uid+"' and sts='dislike'") 
            return res.data.status(200).json({
               data:'',
               err:'false',
               msg:'Dislike Removed'
           })
        }
        catch(e){
            return res.data.status(400).json({
                data:'',
                err:'True',
                msg:e
            })
        } 
    }
}