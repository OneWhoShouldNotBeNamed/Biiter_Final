const c = require('../server.js');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const jwtKey='secretk3y';

// Get all beats
exports.allBeats = async (req, res) => {
    try {
        let a = await c.query('select * from beats order by CreatedAt Desc')
            return res.status(200).json({
             data:a
        })
    } catch (e) {
        return res.status(400).json({
            err:'True',
            msg: 'Error Users Not Found!!!!',
            data:''
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
                        //  expiresIn: 1440
                      })
                      console.log(token)
                      res.status(200).json({
                          err:'false',
                          msg:'Login Sucessfull',
                          data:token
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
   let auth_id = req.headers['authorization'].split(' ')[1]
    const beat={
        uid:(jwt.verify(auth_id, jwtKey)).id,
        beat:req.body.beat
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
            data:e
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
    let sql = await(c.query("select * from users where name like '%"+ find +"%'"))
    if(sql.length<=0 || sql.length==null)
    {
        return res.status(400).json({
            data:{},
            err:'Not Found!!!',
            msg:'Sorry No Users Found With Matching Cases'
        })
    }
    else{
        return res.status(200).json({
            data:sql,
            err:false,
            msg:'kitty'
        })
    }
} 
//Follow || Unfollow
exports.follow = async  (req, res) => {
    let auth_id = req.headers['authorization'].split(' ')[1]
    const follow={
    id : req.body.id,
    uid:(jwt.verify(auth_id, jwtKey)).id}
 let sts= await c.query("select * from followers where u_id ="+ follow.uid +" and follows_id= "+ follow.id  +"")
 if (sts.length<=0||sts==null)
 {
     try{
         console.log("insert into followers values ('"+ follow.uid +"','"+ follow.id +"')")
         let flw = await c.query("insert into followers values ('"+ follow.uid +"','"+ follow.id +"')") 
         return res.status(200).json({
            data:'',
            err:'false',
            msg:'Following User'
        })
     }
     catch(e){
         return res.status(400).json({
             data:'',
             err:'True',
             msg:e
         })
     }
 }
 else{
    try{
        console.log("delete from followers where u_id ='"+ follow.uid+"' and follows_id='"+ follow.id +"'")
        let unflw = await c.query("delete from followers where u_id ='"+ follow.uid+"' and follows_id='"+ follow.id +"'") 
        return res.status(200).json({
           data:'',
           err:'false',
           msg:'Unfollowing User'
       })
    }
    catch(e){
        return res.status(400).json({
            data:'',
            err:'True',
            msg:e
        })
    }
 }
}
//Like||Dislike

exports.heart= async (req,res)=>{
    let auth_id = req.headers['authorization'].split(' ')[1]
     date=new Date()
     bid = req.body.beat,
     uid=(jwt.verify(auth_id, jwtKey)).id
     console.log(req.body.sts)
     console.log("select sts from status where u_id = "+ uid +" and beats_id ="+ bid+"" )
     let cu = await c.query("select sts from status where u_id = "+ uid +" and beats_id ="+ bid+"" )
    //console.log(cu[0].sts)
    //  console.log("1"+cu.length)
try{
    if((req.body.sts =='Like'||'Dislike') && (cu.length <=0 || cu==null)){
        let stat1 = await c.query("insert into status values ("+ bid +", '"+ req.body.sts +"',"+ uid +",'"+ date +"')") 
     //    console.log("3"+stat1)
        return res.status(200).json({
         data:'',
         err:'False',
         msg:`${req.body.sts}`
     })
     }
    else if(req.body.sts == cu[0].sts)
    {
       let stat = await c.query("delete from status where beats_id = "+ bid +" and sts ='"+ req.body.sts +"' and u_id="+ uid +"") 
    //    console.log("2"+stat)
       return res.status(200).json({
        data:'',
        err:'False',
        msg:`${req.body.sts}`
    })
    }
    else{
        let stat2 = await c.query("update status set sts ='"+ req.body.sts +"' where beats_id= "+ bid +" and u_id= "+ uid +"") 
        // console.log("4"+stat)
        return res.status(200).json({
         data:'',
         err:'False',
         msg:`${req.body.sts}`
     }) 
    }
}
catch(e){
    return res.status(400).json({
        data:'',
        err:'True',
        msg:e

})}
}
