import {Injectable, NgZone} from '@angular/core';
import {LocalStorageService} from "../localStorage/LocalStorage.service";
import {WSChatMessage} from "../../models/ChatModels/WSChatMessage";
import {QueuedWSChatMessage} from "../../models/ChatModels/QueuedWSChatMessage";
import {UIChatMessage} from "../../models/ChatModels/UIChatMessage";
import {UserProfileService} from "../user/user-profile.service";
import {UserMessagesService} from "../user/user-messages.service";

@Injectable()
export class PendingMessagesQueue {

    messages: QueuedWSChatMessage[] = [];

    constructor(private localStorage: LocalStorageService,
                private userProfileService: UserProfileService,
                private userMessagesService: UserMessagesService,
                private zone: NgZone) {

        let messagesJsons = localStorage.getAllWithPrefix("chat");
        let retrievedMessages: QueuedWSChatMessage[] = [];
        let tempIds = [];
        messagesJsons.forEach(json => {
            retrievedMessages.push(new QueuedWSChatMessage(JSON.parse(json)));
            tempIds.push(JSON.parse(json).temp_id);
        });

        userMessagesService.checkMessages(tempIds)
            .subscribe(response => {
                response.forEach(deliveredMessage => {
                    for (let i = 0; i < retrievedMessages.length; i++) {
                        if (deliveredMessage.temp_id == retrievedMessages[i].temp_id) {
                            retrievedMessages.splice(i, 1);
                        }
                    }
                });

                this.messages = this.messages.concat(retrievedMessages);
            });
    }

    public push(message: WSChatMessage | QueuedWSChatMessage) {
        let preparedMessage: QueuedWSChatMessage = (message instanceof WSChatMessage) ? new QueuedWSChatMessage(message) : message;
        this.messages.push(preparedMessage);
        this.localStorage.set(preparedMessage.temp_id, preparedMessage);

        return preparedMessage;
    }

    public popMessageByTempId(temp_id: string): QueuedWSChatMessage {
        let result:any = false;
        let resultIndex = -1;
        this.messages.forEach((message, index) => {
            if (message.temp_id == temp_id) {
                result = message;
                resultIndex = index;
            }
        });

        if (result instanceof QueuedWSChatMessage) {
            this.localStorage.remove(result.temp_id);
            this.messages.splice(resultIndex, 1);
        }

        return result;
    }

    public prepareMessageForUI(message: any): UIChatMessage {
        let data:any = {
            message_id: message.message_id,
            sender: {
                id: message.sent_by, //this.userProfileService.userProfile.path_id,
                photo: message.sender ? message.sender.photo : this.userProfileService.userProfile.user_picture,
                name: message.sender ? message.sender.name : this.userProfileService.userProfile.display_name,
            },
            text: message.text,
            datetime: new Date(),
            attachments: {
                photos: [],
                videos: []
            }
        };

        message.body.forEach(item => {
            switch (item.protocol) {
                case "img":
                    data.attachments.photos.push(item.message);
                    break;
                case "video":
                    data.attachments.videos.push(item.message);
                    break;
            }
        });

        return new UIChatMessage(data);
    }

    public getPendingMessagesForChat(chat_id: string): UIChatMessage[] {
        let result:UIChatMessage[] = [];

        this.messages.forEach(message => {
            if (message.chat_id === chat_id)
                result.push(this.prepareMessageForUI(message));
        });

        return result;
    }

}