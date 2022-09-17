const mongoose = require('mongoose');
const express = require('express');
const _ = require("lodash");
const bodyParser = require('body-parser');
const date= require(__dirname+"/date.js");
const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-shivang:shivang5@cluster0.9jote2f.mongodb.net/todolistDB");

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name:"Welcome to your todolist!"

});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name:"<-- Hit this to delete an item."
});

const defaultItems=[item1,item2,item3];


const listSchema={
    name:String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);
// Item.deleteMany({_id:"6320c80980fc176372a944d0"},function(err){
//     if(err){
//         console.log(err);
//     }else{
//         console.log("Success");
//     }
// });





app.get("/", function(req, res)
{
    let day = date.getDate();


    Item.find({}, function(err,founditems){


        if(founditems.length === 0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("Success");
                }
            });
            res.redirect("/");

        }else{
            res.render("list", {listTitle: day, newListItems: founditems});
        }
        
    });
  
});




app.get("/:customListName", function(req,res){
    const customListName= _.capitalize(req.params.customListName);
    List.findOne({name: customListName}, function(err,foundList){
        if(!err){
            if(!foundList){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            }else{
                res.render("list", {listTitle: foundList.name, newListItems:foundList.items});
            }
        }
    });
    
    
    const list = new List({
        name: customListName,
        items: defaultItems
    });

    

    list.save();
});


// app.get("/work", function(req, res)
// {
//     res.render("list",{listTitle: "Work list", newListItems: workItems})
  
// });

// app.post("/work", function(req,res){
//     const itemName = req.body.newItem;
//     const item = new Item({
//         name: itemName
//     });

//     item.save();

//     res.redirect("/");




//     workItems.push(item);
//     res.redirect("/work");
// })


// app.get("/about", function(req,res){
//     res.render("about");
// });

app.post("/", function(req, res){
    let day = date.getDate();
    const itemName = req.body.newItem;
    const listname = req.body.list;


    const item = new Item({
        name: itemName
    });

    if(listname == day){
        item.save();
        res.redirect("/");
    }else{
            List.findOne({name: listname}, function(err, foundList){
                foundList.items.push(item);
                foundList.save();
                res.redirect("/"+ listname);
 
        });
    }



    // if(req.body.list=="Work"){
    //     workItems.push(item);
    //     res.redirect("/work");

    // }
    // else{
    // items.push(item);
    // res.redirect("/");
    // }
});



app.post("/delete",function(req,res){
    const checkedItemId= req.body.checkbox;
    const listname = req.body.listname;
    let day =date.getDate();

    if(listname == day){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(!err){
                console.log("Successfully deleted");
                res.redirect("/");
           }
        });
    }else{
        List.findOneAndUpdate({name: listname},{$pull: {items: {_id: checkedItemId}}}, function(err,foundList){
            if(!err){
                res.redirect("/"+listname);
            }
        });
    }   
});


let port = process.env.PORT;
if(port == null || port == ""){
    port = 3000;
}

app.listen(port, function(){
    console.log("Server is running");
});