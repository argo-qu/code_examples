import {Component, OnInit, Input, EventEmitter, Output, AfterViewInit} from '@angular/core';
import {UIChatMessage} from "../../../models/ChatModels/UIChatMessage";
import {DomSanitizer} from "@angular/platform-browser";
import {CommonFancyboxSettings} from "../../../models/Common/CommonFancyboxSettings";
import {UserProfileService} from "../../../services/user/user-profile.service";

declare var $:any;

@Component({
    selector: 'feed-message',
    templateUrl: './feed-message.component.html',
    styleUrls: ['./feed-message.component.css']
})
export class FeedMessageComponent implements OnInit, AfterViewInit {

    @Input() pending: boolean = false;
    @Input() index: number;
    @Input() message: UIChatMessage;
    @Output() onSelectFriend: EventEmitter<any> = new EventEmitter;
    @Output() onMessageRemove: EventEmitter<any> = new EventEmitter;

    videos: any[] = [];

    constructor(private sanitizer: DomSanitizer,
                private userProfileService: UserProfileService) {
    }

    ngOnInit() {
        this.message.attachments.videos.forEach(video => {
            this.videos.push(this.sanitizer.bypassSecurityTrustResourceUrl(video));
        })
    }

    playVideo(src) {
        $.fancybox.open({
            padding: '5px',
            content: `<video controls>
                           <source src="${src}" type="video/mp4">
                           <source src="${src}" type="video/ogg">
                           Your browser does not support the HTML5 video player.
                      </video>`,
            type: "html"
        });
    }

    ngAfterViewInit() {
        $('a.js-gallery').fancybox(CommonFancyboxSettings);
    }

    timeFrom(date:Date) {
        const timeDiff = (new Date).getTime() - date.getTime();
        return this.millisecondsToStr(timeDiff);
    }

    millisecondsToStr(milliseconds) {
        const numberEnding = (number) => {
            return (number > 1) ? 's' : '';
        };

        let temp = Math.floor(milliseconds / 1000);
        let years = Math.floor(temp / 31536000);
        if (years) {
            return years + ' year' + numberEnding(years);
        }

        let days = Math.floor((temp %= 31536000) / 86400);
        if (days) {
            return days + ' day' + numberEnding(days);
        }
        let hours = Math.floor((temp %= 86400) / 3600);
        if (hours) {
            return hours + ' hour' + numberEnding(hours);
        }
        let minutes = Math.floor((temp % 3600) / 60);
        if (minutes) {
            return minutes + ' min';
        }
        return 'just now';
    }

    removeMessage() {
        this.onMessageRemove.emit(this.message);
    }
}
