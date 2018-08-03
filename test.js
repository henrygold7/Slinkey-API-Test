const fetch = require('request');
const server = require("../link_app/index");
const request = require('supertest');
const app = request("http://localhost:8000");

var baseUser;
var baseFolder;
var baseLink;
var baseLink_on_folder;

describe("Test all routes", () => {
    test("1: set bases", async (done) => {
        const {text: user} = await app.post("/users").type('form').send({username: 'henry31', password: 'goldrush', firstname: 'griff'});
        baseUser = JSON.parse(user);
        const {text: folder} = await app.post("/folders").type('form').send({user_id: baseUser.id, name: 'likes'});
        baseFolder = JSON.parse(folder);
        const {text: link} = await app.post("/links").type('form').send({user_id: baseUser.id,
                                url: 'fake url',
                                img: 'fake img',
                                headline: 'BREAKING NEWS'});
        baseLink = JSON.parse(link);
        const {text: link_on_folder} = await app.post("/link_on_folders").type('form').send({link_id: baseLink.id,
                                                                folder_id: baseFolder.id,});
        baseLink_on_folder = JSON.parse(link_on_folder);
        done();
    })
    test("2: get user: henry31", async (done) => {
      const {text: res} = await app.get("/users/"+baseUser.id);
      expect(JSON.parse(res).username).toEqual("henry31");
      done();
    });
    test("3: Get folder: likes", async (done) => {
        const {text: res} = await app.get("/folders/"+baseFolder.id);
        expect(JSON.parse(res).name).toEqual("likes");
        done();
    });
    test("4: Get link: BREAKING NEWS", async (done) => {
        const {text: res} = await app.get("/links/"+baseLink.id);
        expect(JSON.parse(res).headline).toEqual("BREAKING NEWS");
        done();
    });
    test("5: Get link_on_folder with order 4", async (done) => {
        const {text: res} = await app.get("/link_on_folders/"+baseLink_on_folder.id);
        expect(JSON.parse(res).order).toBeGreaterThan(0);
        done();
    });
    test("6: post user, then delete them", async (done) => {
        const {text: res} = await app.post("/users").type('form').send({username: 'gold', password: 'goldrush', firstname: 'griff'});
        expect(JSON.parse(res).username).toEqual('gold');
        const {text: res2} = await app.delete("/users/"+JSON.parse(res).id);
        expect(res2).toEqual("user "+JSON.parse(res).id+" deleted!");
        done();
    });
    test("7: post folder, then delete it", async (done) => {
        const {text: res} = await app.post("/folders").type('form').send({user_id: baseUser.id, name: 'testfolder'});
        expect(JSON.parse(res).name).toEqual('testfolder');
        const {text: res2} = await app.delete("/folders/"+JSON.parse(res).id);
        expect(res2).toEqual("folder "+JSON.parse(res).id+" deleted!");
        done();
    });
    test("8: post link, then delete it", async (done) => {
        const {text: res} = await app.post("/links").type('form').send({user_id: baseUser.id,
                                                                    url: 'fake url',
                                                                    img: 'fake img',
                                                                    headline: 'NEWS'});
        expect(JSON.parse(res).url).toEqual('fake url');
        const {text: res2} = await app.delete("/links/"+JSON.parse(res).id);
        expect(res2).toEqual('link '+JSON.parse(res).id+" deleted!");
        done();
    });
    test("9: post link_on_folder then delete it", async (done) => {
        const {text: res} = await app.post("/link_on_folders").type('form').send({link_id: baseLink.id,
                                                                                folder_id: baseFolder.id});
        expect(JSON.parse(res).order).toBeGreaterThan(0);
        const {text: res2} = await app.delete("/link_on_folders/"+JSON.parse(res).id);
        expect(res2).toEqual('link_on_folder '+JSON.parse(res).id+" deleted!");
        done();
    });
    test("10: Post folder, patch the name, delete it", async (done) => {
        const {text: txt} = await app.post("/folders").type('form').send({user_id: baseUser.id,
                                                                        name: 'news'});
        expect(JSON.parse(txt).name).toEqual('news');
        const {text: txt2} = await app.patch('/folders/'+JSON.parse(txt).id).type('form').send({name: 'fake news'});
        expect(JSON.parse(txt2).name).toEqual('fake news');
        const {text: txt3} = await app.delete('/folders/'+JSON.parse(txt2).id);
        expect(txt3).toEqual('folder '+JSON.parse(txt).id+' deleted!')
        done();
    });
    test("11: get nonexistent user from query ", async (done) => {
        const {text: res} = await app.get("/users?username="+'notusername');
        expect(JSON.parse(res)).toEqual([]);
        done();
    });
    test("12: patch all user fields", async (done) => {
        const {text: res} = await app.patch("/users/"+baseUser.id).type('form').send({username: 'newusername',
                                                                                    firstname: 'new name',
                                                                                    propic: 'new pic'});
        expect(JSON.parse(res).username).toEqual('newusername');
        expect(JSON.parse(res).firstname).toEqual('new name');
        expect(JSON.parse(res).propic).toEqual('new pic');
        done();
    });
    test("13: delete bases", async (done) => {
        const {text: res4} = await app.delete("/link_on_folders/"+baseLink_on_folder.id);
        const {text: res3} = await app.delete("/links/"+baseLink.id);
        const {text: res2} = await app.delete("/folders/"+baseFolder.id);
        const {text: res} = await app.delete("/users/"+baseUser.id);
        expect(res).toEqual('user '+baseUser.id+' deleted!');
        expect(res2).toEqual('folder '+baseFolder.id+' deleted!');
        expect(res3).toEqual('link '+baseLink.id+' deleted!');
        expect(res4).toEqual('link_on_folder '+baseLink_on_folder.id+' deleted!');
        done();
    });
    test("14: debugger", async (done) => {
        var res;
        await fetch.get("http://localhost:8000/folders?user_id=c1dfc0a0-c5f2-4f1c-8210-cdde414a328b",
            function(error, response, body){
                res = response;
            });
        expect(res).toEqual("something");
        done();
    })

});