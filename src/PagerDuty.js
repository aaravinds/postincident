var request =require('request')
var async = require('async');
const axios = require('axios');

class PagerDuty {
    constructor(params) {
        this.serverURL = 'https://api.pagerduty.com'
        this.authToken = params.authToken;
    }
    getServices()
    {
        const options = {
            url: `${this.serverURL}/services`,
            method: "GET",
            headers: {
              Accept: "application/vnd.pagerduty+json;version=2",
              Authorization: `Token token=${this.authToken}`
            } ,
            rejectUnauthorized:false
          }; 
          return new Promise(function(resolve,reject){
              var parsedBody;

              request.get(options,function(err,response,body){
                  if (err){
                      reject(err)
                  }
				  if(body.includes('Authorization Required') || response.statusCode==401){
                      return reject('Unautorized')
                  }
                  parsedBody=JSON.parse(body)
                  if (parsedBody.error)
                  {
                      reject(parsedBody.error.message)
                  }
                  resolve(parsedBody.services)
              })
          })
    }
    getIncidents() {
        const options = {
            url: `${this.serverURL}/incidents`,
            method: "GET",
            headers: {
              Accept: "application/vnd.pagerduty+json;version=2",
              Authorization: `Token token=${this.authToken}`
            } ,
            rejectUnauthorized:false
          }; 
          return new Promise(function(resolve,reject){
              var parsedBody;

              request.get(options,function(err,response,body){
                  if (err){
                      reject(err)
                  }
				  if(body.includes('Authorization Required') || response.statusCode==401){
                      return reject('Unautorized')
                  }
                  parsedBody=JSON.parse(body)
                  if (parsedBody.error)
                  {
                      reject(parsedBody.error.message)
                  }
                  resolve(parsedBody.incidents)
              })
          })
    }
    createIncident(source,newIncident){
        const options = {
            url: `${this.serverURL}/incidents`,
            method: "POST",
            headers: {
              Accept: "application/vnd.pagerduty+json;version=2",
              Authorization: `Token token=${this.authToken}`,
              from:source,
              'Content-Type': 'application/json'
            },
            rejectUnauthorized:false,
            body: JSON.stringify(newIncident)
          };
          return new Promise(function(resolve,reject){
            var parsedBody;

            request.post(options,function(err,response,body){
                if (err){
                    reject(err)
                }
				if(body.includes('Authorization Required') || response.statusCode==401){
                      return reject('Unautorized')
                  }
                parsedBody = JSON.parse(body)
                if (parsedBody.error)
                {
                    reject(parsedBody.error)
                }
                resolve(parsedBody.incident)
            })
        }) 

    }
    getOnCallPersonelList() {
        const options = {
            url: `${this.serverURL}/oncalls`,
            method: "GET",
            headers: {
              Accept: "application/vnd.pagerduty+json;version=2",
              Authorization: `Token token=${this.authToken}`
            } ,
            rejectUnauthorized:false
          }; 
          return new Promise(function(resolve,reject){
              var parsedBody;

              request.get(options,function(err,response,body){
                  if (err){
                      reject(err)
                  }
				  if(body.includes('Authorization Required') || response.statusCode==401){
                      return reject('Unautorized')
                  }
                  parsedBody=JSON.parse(body)
                  if (parsedBody.error)
                  {
                      reject(parsedBody.error.message)
                  }
                  resolve(parsedBody.oncalls)
              })
          })
    }
    getSchedules() {
        const options = {
            url: `${this.serverURL}/schedules`,
            method: "GET",
            headers: {
              Accept: "application/vnd.pagerduty+json;version=2",
              Authorization: `Token token=${this.authToken}`
            } ,
            rejectUnauthorized:false
          }; 
          return new Promise(function(resolve,reject){
              var parsedBody;

              request.get(options,function(err,response,body){
                  if (err){
                      reject(err)
                  }
				  if(body.includes('Authorization Required') || response.statusCode==401){
                      return reject('Unautorized')
                  }
                  parsedBody=JSON.parse(body)
                  if (parsedBody.error)
                  {
                      reject(parsedBody.error.message)
                  }
                  resolve(parsedBody.schedules)
              })
          })
    }
     getChannels(){
            const options = {
                url: `${this.serverURL}/services`,
                method: "GET",
                headers: {
                  Accept: "application/vnd.pagerduty+json;version=2",
                  Authorization: `Token token=${this.authToken}`
                } ,
                rejectUnauthorized:false
              };
              return new Promise(function(resolve,reject){
                  var parsedBody;
                   request.get(options,function(err,response,body){
                      if (err){
                          reject(err)
                      }
    				  if(body.includes('Authorization Required') || response.statusCode==401){
                          return reject('Unautorized')
                      }
                      parsedBody=JSON.parse(body)
                      if (parsedBody.error)
                      {
                          reject(parsedBody.error.message)
                      }
                      console.log('services',parsedBody.services.map(i => ({ label: i.name, value: i.id })));

                      //resolve(parsedBody.services)
                      resolve(parsedBody.services.map(i => ({ label: i.name, value: i.id })))
                  })
              })
        }
      /*  async function getChannels1() {
        	try {
        		const body = {token: process.env.SLACK_ACCESS_TOKEN};
                  const response = await axios.post('https://slack.com/api/conversations.list', qs.stringify(body));
        		         console.log('listOfChannelList!:', response.data.channelList.map(i => ({ label: i.name, value: i.id })))
                        return response.data.channelList.map(i => ({ label: i.name, value: i.id }));
        	} catch (err) {
        		console.log(err);
        	}
        }*/

}

module.exports=PagerDuty