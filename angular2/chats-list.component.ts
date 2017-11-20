import {Component, OnInit, NgZone, Input, Output, EventEmitter} from '@angular/core';
import {UserMessagesService} from "../../../services/user/user-messages.service";
import {MessengerSocketService} from "../../../services/messenger/MessengerSocketService";
import {Broadcaster} from "../../../services/broadcaster";
import {Observable} from "rxjs";
import {UserProfileService} from "../../../services/user/user-profile.service";
import {PendingMessagesQueue} from "../../../services/messenger/PendingMessagesQueue";

@Component({
    selector: 'chats-list',
    templateUrl: './chats-list.component.html',
    styleUrls: [
        '../../../pages/user-messages/user-messages.component.css',
        './chats-list.component.css'
    ]
})
export class ChatsListComponent implements OnInit {

    @Input() chatsList: any[];
    @Input() chatsVisible: boolean;
    @Output() chatSelected: EventEmitter<any> = new EventEmitter<any>();

    searchString: string = "";
    selectedChat: any;
    allFriendsList: any[] = [];
    selectedParticipants: any[] = [];
    isAllFriendsLoading: boolean = false;
    isSelectingNewChatParticipants: boolean = false;

    constructor(private userMessagesService: UserMessagesService,
                private messengerSocketService: MessengerSocketService,
                private userProfileService: UserProfileService,
                private broadcaster: Broadcaster) {
        broadcaster.on('messengerSocket:chat_created')
            .subscribe(data => this.onChatCreated(data));

        broadcaster.on('messengerSocket:incoming:chat_list')
            .subscribe(data => this.onIncoming(data));

        broadcaster.on('messenger:action:remove_chat_from_list')
            .subscribe(data => this.onRemoveChat(data))
    }

    ngOnInit() {
    }

    selectChat(chat: any) {
        const self = this;
        if (this.selectedChat) {
            if (this.selectedChat.chat_id == chat.chat_id)
                this.selectedChat = undefined;
            else
                openChat();
        } else
            openChat();

        this.chatSelected.emit(this.selectedChat);

        function openChat() {
            self.selectedChat = chat;
            self.chatsVisible = false;
            self.messengerSocketService.openChat(self.selectedChat.chat_id);
            chat.new_messages = 0;
        }
    }

    selectNewChatParticipants() {
        this.selectedParticipants = [];
        this.isSelectingNewChatParticipants = true;
        this.isAllFriendsLoading = true;

        this.userMessagesService.loadUserFriends()
            .catch(error => {
                this.isAllFriendsLoading = false;
                this.allFriendsList = this.userMessagesService.allFriendsMock;
                return Observable.throw(error);
            })
            .subscribe(response => {
                this.isAllFriendsLoading = false;
                this.allFriendsList = this.userMessagesService.allFriendsMock;                
            });
    }

    selectNewChatParticipant(participant) {
        this.selectedParticipants.push(participant.id);
        let createChatSuccess = this.createNewChat(participant.picture, participant.name);

        if (createChatSuccess)
            this.cancelSelectingNewChatParticipants();
    }

    createNewChat(picture, name) {
        if (this.selectedParticipants.length > 0)
            return this.messengerSocketService.createNewChat(this.selectedParticipants, picture, name);

        return false;
    }

    cancelSelectingNewChatParticipants() {
        this.isSelectingNewChatParticipants = false;
        this.selectedParticipants = [];
    }

    searchForChats() {
        this.selectNewChatParticipants();
    }

    private onRemoveChat(removingChat) {
        let chat_id = removingChat.chat_id;
        this.userMessagesService.removeChat(chat_id)
            .catch(error => {
                this.removeChatUICallback(chat_id);
                return Observable.throw(error);
            })
            .subscribe(response => this.removeChatUICallback(chat_id))


    }

    private removeChatUICallback(chat_id) {
        let delIndex = null;
        this.chatsList.forEach((chat, index) => {
            if (chat.chat_id == chat_id) {
                delIndex = index;
            }
        });

        if (delIndex) {            
            this.chatsList.splice(delIndex, 1);
        }
    }

    private onIncoming(parsedMessageData: any) {        
        if (parsedMessageData.sent_by !== this.userProfileService.userProfile.path_id) {            
            if (!this.selectedChat || this.selectedChat.chat_id !== parsedMessageData.chat_id) {
                let chatIsInList = false;
                this.chatsList.forEach(chat => {
                    if (parsedMessageData.chat_id === chat.chat_id) {
                        chatIsInList = true;
                        chat.new_messages = (chat.new_messages) ? chat.new_messages + 1 : 1;
                    }
                });                

                if (!chatIsInList) {
                    this.chatsList.unshift({
                        chat_id: parsedMessageData.chat_id,
                        name: parsedMessageData.chat.name,
                        picture: parsedMessageData.chat.picture,
                        new_messages: 1
                    })
                }
            }

            this.broadcaster.broadcast('messengerSocket:incoming', parsedMessageData);
        }
    }

    private onChatCreated(parsedData) {
        if (parsedData.participants.indexOf(this.userProfileService.userProfile.path_id) !== -1 || parsedData.owner == this.userProfileService.userProfile.path_id) {            
            let newChat = {
                chat_id: parsedData.chat_id,
                picture: parsedData.picture,
                name: parsedData.name,
                participants: parsedData.participants
            };

            this.chatsList.unshift(newChat);

            if (parsedData.owner == this.userProfileService.userProfile.path_id) {
                this.selectChat(newChat);
            }
        }
    }

}
