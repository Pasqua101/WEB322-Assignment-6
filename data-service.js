const fs = require('node:fs');

//Defining global array of departments and employees
var departments = [];
var employees = [];


function initialize(){
    
    return new Promise((resolve, reject) => {
        
        
        fs.readFile('./data/employees.json', 'utf8', (err,data) =>{
            if(err) reject("Unable to read employee data");
                employees = JSON.parse(data);
            });
        fs.readFile('./data/departments.json', 'utf8', (err,data)=>{
            if(err) reject("Unable to read from departments data");
                departments = JSON.parse(data);
        });
        console.log(employees);
        console.log(departments);
        resolve("Read successfully");
        
    });

};

function getAllEmployees(){
    
    return new Promise(function(resolve, reject){
        
        if(employees.length === 0){
            reject("no results returned");        
        }

        resolve(employees);
    });
};

function getManagers(){

    return new Promise(function(resolve, reject){
        if(employees.length === 0){
            reject("no results returned");
        }
        else{
            
            // resolve(employees.filter(() => {return true;}));
            let arrOfManagers = [];

            for(let i = 0; i < employees.length; i++){
                if(employees[i].isManager === true){
                    arrOfManagers.push(employees[i]);
                }
                
            }

            resolve(arrOfManagers);
        }
        
    })

};

function getDepartments(){
    return new Promise(function(resolve, reject){
        
        if(departments.length === 0){
            reject("No results returned");
        }
        else{
            resolve(departments);
        }
        
    });
};
module.exports = {
    initialize,
    getAllEmployees,
    getManagers,
    getDepartments
};