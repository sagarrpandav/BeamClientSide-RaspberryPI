const fs= require('fs');
var cmd = require('node-cmd');
var sleep = require('sleep');
var newcamps;
var count_camps=0;
var camps_durations=[30,30,30,30,30,30,30,30];
var no_of_images=[];
var delays=[];
var setProjOn=true;
var currentdelay=0;
var current_no_of_images=0;
var mycount=0;
var myFirstImage=0;
var callFunc=0;

    console.log("Client has started!");
    var SocketIOClass=require("socket.io-client");
    var SocketIOObject=SocketIOClass.connect("http://35.200.170.107:5000");
    var string="";


    SocketIOObject.on("connect",function()
    {
        console.log("id sent");
        SocketIOObject.emit("fromRasPI_setConnectedFlag",{
            data:"0"
        });
  
    });



    SocketIOObject.on("3_img",function(json)
    {
        console.log("Recevd");
        var obj=JSON.parse(json);

        //console.log(obj);
    console.log(obj);
        console.log(obj["campaign_id"]);
        var camp_id=obj["campaign_id"];
        var img_seq=obj["sequence"];
        var camp_duration=obj["duration"];
        var count_img=obj["no_of_images"];
        current_no_of_images=count_img;
        var delay=obj["delay"];
        currentdelay=delay;
        count_camps=obj["no_of_camp"];
        console.log("SEQ="+img_seq);
        console.log("img count ="+count_img);
        camps_durations[camp_id]=camp_duration;
        no_of_images[camp_id]=count_img;
        delays[camp_id]=delay;
        mycount=mycount+1;

        newcamps=false;

        //cmd.get('mkdir '+camp_id,function(err,data,stderr){});
        if(myFirstImage==0)
        {
            console.log("Inside My Image");
            myFirstImage=99;
            cmd.get('ls /home/nitin/Documents/Beam/Client/sagar/Camps/ | grep '+camp_id,function(err,data,stderr){
                if(data==""){
                    console.log("create folder");
                    cmd.get('mkdir /home/nitin/Documents/Beam/Client/sagar/Camps/'+camp_id,function(err,data,stderr){});
                }
                else
                {
                    console.log("Delete and Create folder");
                    cmd.get('rm -r /home/nitin/Documents/Beam/Client/sagar/Camps/'+camp_id,function(err,data,stderr){});
                    cmd.get('mkdir /home/nitin/Documents/Beam/Client/sagar/Camps/'+camp_id,function(err,data,stderr){});
                }
            }

            );
        }
      
        fs.writeFile("/home/nitin/Documents/Beam/Client/sagar/Camps/"+camp_id+"/"+img_seq+".jpg", obj["image"], {encoding: 'base64'}, function(err)
        {
             console.log('File created');
             newcamps=true;

        });
        console.log("Mycount="+mycount+" count_img-1="+(count_img-1));
        if(mycount>=(count_img-1)/2)
        {
            if(callFunc==0)
            {
                callFunc=99;
                console.log("Sleeping");
            sleep.sleep(5);
            myfunc();
            }
          
        }

        //fs.writeFile("/home/pi/project/"+obj["campaign_id"]+"/1.jpg", obj["image"], {encoding: 'base64'}, function(err) {
        //console.log("file created");
        //});


    });


function myfunc()
{
        callFunc=0;
        myFirstImage=0;
        mycount=0;
        console.log("Inside myfunc");
        console.log("current_no_of_images="+current_no_of_images);
        var totalcycle=(current_no_of_images-1)*currentdelay;
        var no=5;
        console.log("totalcycle="+totalcycle);
        console.log("Camopaign  === "+no);
        cmd.get("feh /home/nitin/Documents/Beam/Client/sagar/Camps/0 -F -x --cycle-once -D "+currentdelay,function(err,data,stderr){});
        sleep.sleep(30)    ;
        while(no>0)
        {
            console.log(" feh /home/nitin/Documents/Beam/Client/sagar/Camps/"+no+" -F -x --cycle-once -D "+currentdelay+" -R 1");
            cmd.get(" feh /home/nitin/Documents/Beam/Client/sagar/Camps/"+0+" -F -x --cycle-once -D "+currentdelay+" -R 1",function(err,data,stderr){});
            sleep.sleep(totalcycle);
            no=no-1;
        }
      
    //setProjOn=true;
}

while(false)
{
    if(newcamps==false)
    {
        cmd.get("feh /home/nitin/Documents/Beam/Client/sagar/Camps/default -F -x --cycle-once -D 2 -R 1",function(err,data,stderr){});
        sleep.sleep(8000);
    }
    else
    {
        for(var i=0;i<count_camps;i++)
        {  
            var totalcycle=no_of_images[i]*delays[i];
            var no=camps_durations[i]/totalcycle;
            console.log("Camopaign "+i+" === "+no);
            cmd.get("feh /home/nitin/Documents/Beam/Client/sagar/Camps/"+i+" -x --cycle-once -D 2 -R 1",function(err,data,stderr){});
            sleep.sleep(camps_durations[i]*900);
            no=no-1;
            while(no>0)
            {
                cmd.get("feh /home/nitin/Documents/Beam/Client/sagar/Camps/"+i+" -x --cycle-once -D 2 -R 1",function(err,data,stderr){});
                sleep.sleep(camps_durations[i]*900);
                no=no-1;
            }
        }
    }
    sleep.sleep(1000);
    SocketIOObject.on("connect",function()
    {
        console.log("id sent");
        SocketIOObject.emit("fromRasPI_setConnectedFlag",{
            data:"0"
        });
        var newcamps=false;
    });
}
