let WebIM = require("../../utils/WebIM")["default"];
let disp = require("../../utils/broadcast");

Page({
	data: {
		search_btn: true,
		search_friend: false,
		show_mask: false,
		myName: "",
		member: [],
		messageNum: ""
	},

	onLoad: function(option){
		var me = this;
		disp.on("em.xmpp.subscribe", function(){
			me.setData({
				messageNum: getApp().globalData.saveFriendList.length
			});
		});
		this.setData({
			myName: option.myName
		});
	},

	onShow: function(){
		var me = this;
		this.setData({
			messageNum: getApp().globalData.saveFriendList.length
		});
		let rosters = {
			success: function(roster){
				var member = [];
				for(let i = 0; i < roster.length; i++){
					if(roster[i].subscription == "both"){
						member.push(roster[i]);
					}
				}
				me.setData({
					member: member
				});
				wx.setStorage({
					key: "member",
					data: me.data.member
				});
			}
		};

		// WebIM.conn.setPresence()
		WebIM.conn.getRoster(rosters);
	},
	moveFriend: function(message){
		let me = this;
		let rosters = {
			success: function(roster){
				var member = [];
				for(let i = 0; i < roster.length; i++){
					if(roster[i].subscription == "both"){
						member.push(roster[i]);
					}
				}
				me.setData({
					member: member
				});
			}
		};
		if(message.type == "unsubscribe" || message.type == "unsubscribed"){
			WebIM.conn.removeRoster({
				to: message.from,
				success: function(){
					WebIM.conn.unsubscribed({
						to: message.from
					});
					WebIM.conn.getRoster(rosters);
				}
			});
		}
	},
	handleFriendMsg: function(message){
		wx.showModal({
			title: "添加好友请求",
			content: message.from + "请求加为好友",
			success: function(res){
				if(res.confirm == true){
					WebIM.conn.subscribed({
						to: message.from,
						message: "[resp:true]"
					});
					WebIM.conn.subscribe({
						to: message.from,
						message: "[resp:true]"
					});
				}
				else{
					WebIM.conn.unsubscribed({
						to: message.from,
						message: "rejectAddFriend"
					});
				}
			},
			fail: function(err){
			}
		});
	},

	delete_friend: function(event){
		var delName = event.target.dataset.username;
		wx.showModal({
			title: "确认删除好友" + delName,
			cancelText: "取消",
			confirmText: "删除",
			success: function(res){
				if(res.confirm == true){
					WebIM.conn.removeRoster({
						to: delName,
						success: function(){
							WebIM.conn.unsubscribed({
								to: delName
							});
						},
						error: function(error){
						}
					});
				}

			},
			fail: function(error){
			}
		});
	},

	openSearch: function(){
		this.setData({
			search_btn: false,
			search_friend: true,
			show_mask: true
		});
	},

	cancel: function(){
		this.setData({
			search_btn: true,
			search_friend: false,
			show_mask: false
		});
	},

	add_new: function(){
		wx.navigateTo({
			url: "../add_new/add_new"
		});
	},

	tab_chat: function(){
		wx.redirectTo({
			url: "../chat/chat"
		});
	},

	close_mask: function(){
		this.setData({
			search_btn: true,
			search_friend: false,
			show_mask: false
		});
	},

	tab_setting: function(){
		wx.redirectTo({
			url: "../settings/settings"
		});
	},

	into_inform: function(){
		wx.navigateTo({
			url: "../inform/inform"
		});
	},

	into_groups: function(){
		wx.navigateTo({
			url: "../groups/groups?myName=" + this.data.myName
		});
	},

	into_room: function(event){
		var nameList = {
			myName: this.data.myName,
			your: event.target.dataset.username
		};
		wx.navigateTo({
			url: "../chatroom/chatroom?username=" + JSON.stringify(nameList)
		});
	},

	into_info: function(event){
		wx.navigateTo({
			url: "../friend_info/friend_info?yourname=" + event.target.dataset.username
		});
	},

});