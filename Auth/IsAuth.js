module.exports= (req,res,next)=>{
  jwtKey='secretk3y'
    if (!req.headers['authorization']) {
        res.status(400).json({
          err: true,
          msg: 'No Authorization Header',
          data: {}
        })
      }else{      
      let auth_id = req.headers['authorization'].split(' ')[1]
      if (!auth_id) {
        res.status(400).json({
          err: true,
          msg: 'No Token in Header',
          data: {}
        })
      }
      if(!jwt.verify(auth_id, jwtKey)){
        res.status(400).json({
          err: true,
          msg: '',
          data: {}
        })
      }
      
      next()
}
}
