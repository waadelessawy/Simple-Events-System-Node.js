const {validationResult}=require("express-validator");
const Speaker=require("../Models/speakerModel");
const bcrypt = require("bcrypt");
const { request } = require("express");
const { response } = require("express");
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);
const mongoose = require("mongoose");


module.exports.getAllSpeakers=(request,response)=>{

    Speaker.find({})
           .then((data)=>{
               response.status(200).json(data);
               console.log(data);

           })
           .catch(error=>next(error))
    
}
module.exports.getSpeakerById=(request,response)=>{
    if(request.role !=="admin" && request.role !=="speaker")
    {
        console.log(request.role)
       throw new Error("Not Authorizd");
    }
    Speaker.findById({_id:request.params.id})
           .then(data=>{
               response.status(200).json(data);
               console.log(data);
           })
}


module.exports.createSpeaker=(request,response,next)=>{

    let result = validationResult(request);
    if(!result.isEmpty()){
        let message=result.array().reduce((current,error)=>current+error.msg," ");
        let error = new Error(message);
        error.status=422;
        throw error;

    }
    let speaker = new Speaker({
        _id: mongoose.Types.ObjectId(),
        email:request.body.email,
        username:request.body.username,
        password:request.body.password, 
        city: request.body.city, 
        street:request.body.street, 
        building:request.body.building,
        role:request.body.role
    })
    const salt = bcrypt.genSaltSync(saltRounds);
    speaker.password= bcrypt.hashSync(speaker.password, salt);
 
    speaker.save()
    .then((data)=>{ 
        
        response.status(200).json({message:"speaker created",data})

    }).catch(error=>next(error));
}


module.exports.updateSpeaker=(request,response,next)=>{

    if(request.role !=="admin" && request.role !=="speaker")
    {
       throw new Error("Not Authorizd");
    }
    Speaker.updateOne({_id:request.params.id},{
      
        $set:{
            email:request.body.email,
            username:request.body.username,
            password:bcrypt.hashSync(request.body.password, salt),
            city: request.body.city, 
            street:request.body.street, 
            building:request.body.building
        }
    }).then(data=>{
        if(data.matchedCount==0)
        throw new Error("Speaker not exists");

     
        response.status(200).json({message:"Speaker updated",data});

    })
    .catch(error=>next(error))

        
}


module.exports.deleteSpeaker=(request,response,next)=>{
       if(request.role !=="admin")
       {
            throw new Error("Not Authorizd");
       }  
        Speaker.deleteOne({_id:request.params.id},{
          
        }).then(data=>{
             if(data.deletedCount==0)
            throw new Error("Speaker not exists");
            response.status(200).json({message:"Speaker deleted",data});
    
        })
        .catch(error=>next(error))
    
}



