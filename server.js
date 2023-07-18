const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");


const workItems = [];



app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Sudeep-Bhagat:Test-123@cluster0.k47i9n6.mongodb.net/toDoList");

const itemSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
    name: "Welcome to ToDoList",
});

const item2 = new Item({
    name: "Press + to add items!",
});

const item3 = new Item({
    name: "<-- Hit this to delete items",
});

const defaultItems = [item1,item2,item3];





app.get("/",function(req,res){
   
    Item.find().then((items)=>{

        if(items.length === 0){
            Item.insertMany(defaultItems).then(()=>{
                console.log("Successfully added default items");
            
            })
            .catch((err)=>{
                console.log(err);
            });
            res.redirect("/");
        }
        else{
            res.render("list", {listTitle : "Today", newListItem : items});
        }
        
    })
    .catch((err)=>{
        console.log(err);
    }); 
   
});

const listSchema = {
    name : String,
    items : [itemSchema]
}

const List = mongoose.model("List",listSchema);

app.get("/:customListName",function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name : customListName}).then((foundList)=>{
        if(!foundList){
            const list = new List({
                name : customListName,
                items : defaultItems
            })
            list.save();
            res.redirect("/" + customListName);

        }
        else{
            res.render("list",{listTitle : customListName, newListItem : foundList.items})
        }
    })
   
});

app.post("/",function(request,response){
    const itemName = request.body.input;
    const listName = request.body.list;

    const item = new Item({
        name  : itemName
    });

    if(listName === "Today"){
        item.save();
        response.redirect("/");

    }
    else{
        List.findOne({name:listName}).then((foundList)=>{
            foundList.items.push(item);
            foundList.save();
            response.redirect("/" + listName);
        });
    }

    
});

app.post("/work", function(req,res){
    let item = req.body.input;
    workItems.push(item);
});

app.post("/delete",function(req,res){
    const itemChecked = req.body.checkbox;
    const listName = req.body.listName;
    console.log(itemChecked);

    if(listName === "Today"){

        Item.findByIdAndRemove(itemChecked).then(()=>{
            console.log("Successfully deleted items");
        })
        .catch((err)=>{
            console.log(err);
        });
        res.redirect("/");

    }
    else{
        List.findOneAndUpdate({name : listName}, {$pull : {items : {_id:itemChecked}}}).then((foundList)=>{
            res.redirect("/" + listName);
        });
    }

    

})

app.listen("3000",function(){
    console.log("Server is running in port 3000");
});

