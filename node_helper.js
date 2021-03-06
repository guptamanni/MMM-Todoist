"use strict";

/* Magic Mirror
 * Module: MMM-Todoist
 *
 * By Chris Brooker
 * 
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const request = require('request');

module.exports = NodeHelper.create({
    start: function() {
        console.log("Starting node helper for: " + this.name);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "FETCH_TODOIST") {
            this.config = payload;
            this.fetchTodos();
        }
    },
    
    fetchTodos : function() {
        var self = this;
        //request.debug = true;

        request({
                url: self.config.apiBase + "/" + self.config.apiVersion + "/" + self.config.todoistEndpoint + "/",
                method: "POST",
                headers: {
                    'content-type': 'application/x-www-form-urlencoded',
                    'cache-control': 'no-cache'
                },
                form: {
                    token: self.config.accessToken,
                    sync_token: '*',
                    resource_types: self.config.todoistResourceType
                }
            },
            function(error, response, body) {
                if (error) { 
                     self.sendSocketNotification("FETCH_ERROR", {
                        error: error
                    });
                    return console.error(" ERROR - MMM-Todoist: " + error); 
                }
                if (response.statusCode === 200) {
                    self.sendSocketNotification("TASKS", JSON.parse(body));
                }
                
            });
    }
});