(()=>{
    document.querySelectorAll(".video").forEach(elm=>{
        let video=new Video(elm);
        video.execute();
    });
    function Video(videoElm){
        this.line_w=0;
        this.id_time=null;
        this.counter_visible=false;
        this.is_full_screen=false;
        this.video_elm=videoElm;
        this.video_tag=this.video_elm.children[0];
        this.play_pause_btn=this.video_elm.children[1].children[0];
        this.line_time=this.video_elm.children[1].children[1];
        this.line_sound=this.video_elm.children[1].children[3].children[1].children[0];
        this.current_time_elm=this.video_elm.children[1].children[2].children[0];
        this.counter_time=this.video_elm.children[1].children[1].children[1];
        this.duration_elm=this.video_elm.children[1].children[2].children[1];
        this.counter_sound=this.video_elm.children[1].children[3].children[1].children[0].children[1];
        this.volume_btn=this.video_elm.children[1].children[3].children[0];
        this.full_screen_btn=this.video_elm.children[1].children[4];
        this.execute=function(){
            this.full_screen_btn.addEventListener("click",this.full_screen.bind(this));
            this.volume_btn.addEventListener("click",this.mute_unmute.bind(this));
            this.volume_btn.addEventListener("keyup",e=>{
                if(e.keyCode==13||e.keyCode==32) this.mute_unmute();
            });
            this.full_screen_btn.addEventListener("keyup",e=>{
                if(e.keyCode==13||e.keyCode==32) this.full_screen();
            });
            this.video_tag.addEventListener("loadeddata",()=>{
                this.duration_elm.innerHTML=timer.trasform_seconds(this.video_tag.duration)
                this.line_w=this.line_time.clientWidth;
                this.counter_sound.innerHTML=Math.round(this.video_tag.volume)*100;
                this.line_sound.style.setProperty('--pos', Math.round(this.video_tag.volume)*100 + "%");
            });
            [this.play_pause_btn,this.video_tag]
            .forEach(elm=>elm.addEventListener("click",this.play_pause.bind(this)));
            this.play_pause_btn.addEventListener("keyup",e=>{
                if(e.keyCode==13||e.keyCode==32) this.play_pause()
            });
            this.line_time.addEventListener("keydown",e=>this.time_keyboard_navigation(e));
            this.line_time.addEventListener("mouseover",()=>{this.counter_visible=true;
            this.counter_time.innerHTML=timer.trasform_seconds(this.video_tag.currentTime);});
            this.line_time.addEventListener("mouseout",()=>this.counter_visible=false);
            this.line_time.addEventListener("mousedown",e=>this.limited_movement(this.move.bind(this),e,this.line_time));
            window.addEventListener("resize",()=>this.line_w=this.line_time.clientWidth);
            this.line_sound.addEventListener("mousedown",e=>this.limited_movement(this.volume.bind(this),e,this.line_sound));
            this.line_sound.addEventListener("keydown",e=>this.volume_keyboard_navigation(e));
        };
        this.play_pause=function(){
            if(this.video_tag.paused) this.play();
            else this.pause();
        };
        this.play=function(){
            this.video_tag.play();
            this.play_pause_btn.innerHTML="&#10074;&#10074;";
            this.update();
        };
        this.pause=function(){
            this.video_tag.pause();
            this.play_pause_btn.innerHTML="▶";
            clearTimeout(this.id_time);
        };
        this.update=function(){
            this.line_time.style.setProperty('--pos', this.video_tag.currentTime/this.video_tag.duration*100 + "%");
            this.current_time_elm.innerHTML=timer.trasform_seconds(this.video_tag.currentTime);
            this.id_time=setTimeout(this.update.bind(this),1000);
            if(this.video_tag.currentTime==this.video_tag.duration) this.pause();
            if(this.counter_visible) this.counter_time.innerHTML=timer.trasform_seconds(this.video_tag.currentTime);
        };
        this.move=function(e){
            let pos=(e.pageX-this.line_time.getBoundingClientRect().left)/this.line_w*100;
            if(pos>100) pos=100;
            else if(pos<0) pos=0;
            this.line_time.style.setProperty('--pos', pos+"%");
            this.keeps_pause_of(()=>this.video_tag.currentTime=pos/100*this.video_tag.duration);
            [this.current_time_elm,this.counter_time]
            .forEach(elm=>elm.innerHTML=timer.trasform_seconds(this.video_tag.currentTime));
        };
        this.time_keyboard_navigation=function(e){
            if(e.keyCode==39||e.keyCode==32||e.keyCode==37){
                e.preventDefault();
                let current_time=this.video_tag.currentTime;
                let duration=this.video_tag.duration;
                if(e.keyCode==39||e.keyCode==32) 
                    if(current_time+5>duration) this.video_tag.currentTime=duration;
                    else this.keeps_pause_of(()=>this.video_tag.currentTime+=5);
                else 
                    if(current_time-5<0) this.video_tag.currentTime=0;
                    else this.keeps_pause_of(()=>this.video_tag.currentTime-=5);
                this.line_time.style.setProperty('--pos', this.video_tag.currentTime/this.video_tag.duration*100 + "%");
                [this.current_time_elm,this.counter_time]
                .forEach(elm=>elm.innerHTML=timer.trasform_seconds(this.video_tag.currentTime));
            }
        };
        this.volume_keyboard_navigation=function(e){
            if(e.keyCode>36&&e.keyCode<41){
                e.preventDefault();
                let current_volume=this.video_tag.volume;
                if(e.keyCode==39||e.keyCode==38)
                    if(current_volume+.1>1) this.video_tag.volume=1;
                    else this.video_tag.volume+=.1;
                else
                    if(current_volume-.1<0) this.video_tag.volume=0;
                    else this.video_tag.volume-=.1;
                this.line_sound.style.setProperty('--pos', this.video_tag.volume*100 + "%");
                this.counter_sound.innerHTML=Math.round(this.video_tag.volume*100);   
            }
        };
        this.keeps_pause_of=function(f){
            if(this.video_tag.paused){
                f();
                this.pause();
            }else f();
        };
        this.limited_movement=function(f,evt,elm){
            f(evt);
            if(elm.onmousemove==null)
                elm.onmousemove=evt=>f(evt);
            if(document.onmouseup==null) 
                document.onmouseup=()=>{elm.onmousemove=null;document.onmouseup=null};
        };
        this.volume=function(e,position){
            let pos=position||(this.line_sound.getBoundingClientRect().bottom+window.scrollY-e.pageY)/this.line_sound.clientWidth*100;
            if(pos>100) pos=100;
            else if(pos<0) pos=0;
            pos=Math.round(pos);
            this.video_tag.volume=pos/100;
            this.line_sound.style.setProperty('--pos', pos+"%");
            this.counter_sound.innerHTML=pos;
            if(pos!=0&&this.volume_btn.innerHTML!="&#128266") this.volume_btn.innerHTML="&#128266";
            else if(pos==0&&this.volume.textContent!="&#128263") this.volume_btn.innerHTML="&#128263";
        },
        this.mute_unmute=function(){
            if(this.video_tag.volume!=0)this.volume(undefined,"0");
            else this.volume.bind(this)(undefined,"50");
        }
        this.full_screen=function(){
            if(this.video_elm.requestFullscreen&&document.exitFullscreen){
                if(this.is_full_screen) document.exitFullscreen();
                else this.video_elm.requestFullscreen();
                this.is_full_screen=!this.is_full_screen;
            }
        }
    };
    const timer={
        round:function(elm){return Math.round(elm)},
        floor:function(elm){return Math.floor(elm)},
        trasform_seconds:function(s){
            let time="";
            let seconds=this.round(s);
            if(seconds>=60){
                let minutes=this.floor(seconds/60);
                let hours=this.floor(seconds/3600);
                if(hours>0) time=`${this.format(hours)}:${this.format(minutes-hours*60)}`;
                else time=`${this.format(minutes)}`;
                time+=`:${this.format(seconds-minutes*60)}`;
            }
            else time=`00:${this.format(seconds)}`;
            return time;
        },
        format:function(num){
            if(Number.isNaN(num)) return null;
            if(typeof(num)!="string") num=num.toString();
            if(num.length==1) num="0"+num;
            return num;
        }
    };
})();