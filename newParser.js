//TODO
//	Find a way to get the next/prev buttons to skip over a day if needed.
var Path = require('path');
var Hapi = require('hapi');
var server = new Hapi.Server('localhost', 3000);
var newPath="http://localhost:3000/";//Wherever you want to access the program from
var config = require('getconfig');
var simpleS3 = require('simples3');
var s3Store = simpleS3.createClient(config);

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        s3Store.getBucket('static.andyet.com', '/irclogs', function _bucketInfo(err, bucketInfo) {
        var temp = bucketInfo.contents.files;
  		var fileList;
    	var d = new Date('2014-06-28');//Definitive start date of the logs
    	var fileFound=true;
    	var htmlFile = ['<html>', '	<title>List of &Yet IRC logs</title>', '	<body>'];
    	var curD = new Date();
    	var curMonth, curDay, curYear;
    	if(curD.getMonth()+1<10)
   			curMonth = '0' + (curD.getMonth()+1);
    	else
    		curMonth = curD.getMonth() + 1;
    	if(curD.getDate()<10)
    		curDay = '0' + curD.getDate();
    	else
    		curDay = curD.getDate();
    	curYear = curD.getFullYear();
    	var strMonth, strDay, strYear;
    	do
    	{
    		if(d.getMonth()+1<10)
    			strMonth = '0' + (d.getMonth()+1);
    		else
    			strMonth = d.getMonth() + 1;
    		if(d.getDate()<10)
    			strDay = '0' + d.getDate();
    		else
    			strDay = d.getDate();
    		strYear = d.getFullYear();
    		var fs = require('fs');
            for(var i = 0; i < temp.length; i++)
    	        if(temp[i].key == '/irclogs/&yet-'+strYear+'-'+strMonth+'-'+strDay+'.html')
   			      	htmlFile.push('<p><a href="'+newPath+strMonth+'-'+strDay+'-'+strYear+'.html"</a>Log for '+ strMonth+'/'+strDay+'/'+strYear +'.</p>');
    		d.setDate(d.getDate()+1);	
    	}
    	while(strMonth+'/'+strDay+'/'+strYear!=curMonth+'/'+curDay+'/'+curYear)
    	htmlFile.push('	</body>','</html>');
    	reply(htmlFile.join('\n'));
    });}
});

server.route({
	method: 'GET',
	path: '/{file}.html',
	handler: function (request, reply) {
    s3Store.getBucket('static.andyet.com', '/irclogs', function _bucketInfo(err, bucketInfo) {
        var temp = bucketInfo.contents.files;
		var logFile = ['<html>','	<body>'];



        logFile.push('      <div class="calAndLists" style="width:290px; height:300px; background-color:rgba(195, 195, 195, 0.4); position:fixed; top:0px;">');
		var strMonth = request.params.file.substring(0,2), strYear = request.params.file.substring(6,10);
		var maxDays, curMonth;
		var d = new Date(strYear+'-'+(+strMonth-1)+'-'+request.params.file.substring(3,5));
		switch(+strMonth)
		{
			case 1: maxDays=31; curMonth='January'; break;
			case 2: if(+strYear%4==0){maxDays=29}else{maxDays=28}; curMonth='February'; break;
			case 3: maxDays=31; curMonth='March'; break;
			case 4: maxDays=30; curMonth='April'; break;
			case 5: maxDays=31; curMonth='May'; break;
			case 6: maxDays=30; curMonth='June'; break;
			case 7: maxDays=31; curMonth='July'; break;
			case 8: maxDays=31; curMonth='August'; break;
			case 9: maxDays=30; curMonth='September'; break;
			case 10: maxDays=31; curMonth='October'; break;
			case 11: maxDays=30; curMonth='November'; break;
			case 12: maxDays=31; curMonth='December'; break;
		}

		logFile.push('		<TABLE align="right" BORDER=3 CELLSPACING=3 CELLPADDING=3>',
					 '			<TR>',
					 '				<TD COLSPAN="7" ALIGN=center><B>'+curMonth+' '+strYear+'</B></TD>',
					 '			</TR>',
					 '			<TR>',
					 '				<TD ALIGN=center>Sun</TD>',
					 '				<TD ALIGN=center>Mon</TD>',
					 '				<TD ALIGN=center>Tue</TD>',
					 '				<TD ALIGN=center>Wed</TD>',
					 '				<TD ALIGN=center>Thu</TD>',
					 '				<TD ALIGN=center>Fri</TD>',
					 '				<TD ALIGN=center>Sat</TD>',
					 '			</TR>',
					 '			<TR>');       
        
		//The first week gets made here, because the while loop assumes the day starts at the beginning of the week
		var startDate = new Date(strYear+'-'+strMonth+'-02');//The 02 makes it start on the 1st of the month
        var existTrue = false;
		for(var i = 1; i <= startDate.getDay(); i++)
			logFile.push('				<TD ALIGN=center></TD>');
		for(var i = 1; i <= 7-startDate.getDay(); i++)
		{
			for(var j = 0; j < temp.length; j++)
                if(temp[j].key == '/irclogs/&yet-'+strYear+'-'+strMonth+'-0'+i+'.html')
                    existTrue = true;
            if(existTrue)
                logFile.push('              <TD ALIGN=center><a href="'+newPath+strMonth+'-0'+i+'-'+strYear+'.html">0'+i+'</a></TD>');
            else
                logFile.push('              <TD ALIGN=center>0'+i+'</TD>');
            existTrue = false;
		}
		startDate.setDate(startDate.getDate()+7-startDate.getDay())
		logFile.push('			</TR>','			<TR>');
		var endWk=1, strDay;
		while(startDate.getDate() <= maxDays && +strMonth == startDate.getMonth()+1)
		{
			if(endWk ==8)
			{
				logFile.push('			</TR>','			<TR>');
				endWk=1;
			}
			if(startDate.getDate()<10)
				strDay='0'+startDate.getDate();
			else
				strDay=startDate.getDate();
			for(var j = 0; j < temp.length; j++)
                if(temp[j].key == '/irclogs/&yet-'+strYear+'-'+strMonth+'-'+strDay+'.html')
                    existTrue = true;
            if(existTrue)
			    logFile.push('				<TD ALIGN=center><a href="'+newPath+strMonth+'-'+strDay+'-'+strYear+'.html">'+strDay+'</a></TD>');
	        else
			    logFile.push('				<TD ALIGN=center>'+strDay+'</TD>');
			endWk++;
            existTrue=false;
			startDate.setDate(startDate.getDate()+1);
		}
		if(endWk<7)
			for(var i = endWk; i <= 7; i++)
				logFile.push('				<TD ALIGN=center></TD>');
		logFile.push('			</TR>');
		logFile.push('		</TABLE>');
		//Thus the calendar was invented






		//Now for the prev/next buttons
		var prevDate = new Date(strYear+'-'+strMonth+'-'+request.params.file.substring(3,5)), 
			nextDate = new Date(strYear+'-'+strMonth+'-'+request.params.file.substring(3,5));
			prevDate.setDate(prevDate.getDate());//Not sure why, but it works this way...
			nextDate.setDate(nextDate.getDate()+2);
		var prevMonth, nextMonth, prevDay, nextDay, prevYear, nextYear;
		if(prevMonth < 10)
			prevMonth='0'+prevMonth;
		if(nextMonth < 10)
			nextMonth='0'+nextMonth;
		if(prevDay < 10)
			prevDay='0'+prevDay;
		if(nextDay < 10)
			nextDay='0'+nextDay;
		var prevDone = false;
		while(prevDone==false)
		{
			if(prevDate.getMonth()+1<10)
				prevMonth = '0' + (prevDate.getMonth()+1);
			else
				prevMonth = prevDate.getMonth()+1;
			if(prevDate.getDate()<10)
				prevDay = '0' + prevDate.getDate();
			else
				prevDay = prevDate.getDate();
			prevYear = prevDate.getFullYear();
            var prevExist = false;
			for(var j = 0; j < temp.length; j++)
                if(temp[j].key == '/irclogs/&yet-'+prevYear+'-'+prevMonth+'-'+prevDay+'.html')
                    prevExist = true;
            if(prevExist)
            {
                logFile.push('          <button align="right" onclick="window.location.href=\''+newPath+prevMonth+'-'+prevDay+'-'+prevYear+'.html\'">Previous log</button>');
				prevDone = true;
			}
			else
				prevDate.setDate(prevDate.getDate()-1);
			if(prevMonth+'/'+prevDay+'/'+prevYear=='06/26/2014')
				prevDone=true;//Stops checking; no log files before this date
		}
		var nextDone = false;
		var curD = new Date();//So it'll stop checking once it gets to tomorrow's date
		curD.setDate(curD.getDate()+1);

    	var curMonth, curDay, curYear;
    	if(curD.getMonth()+1<10)
   			curMonth = '0' + (curD.getMonth()+1);
    	else
            curMonth = curD.getMonth() + 1;
    	if(curD.getDate()<10)
    		curDay = '0' + curD.getDate();
    	else
    		curDay = curD.getDate();
    	curYear = curD.getFullYear();
		while(nextDone==false)
		{
			if(nextDate.getMonth()+1<10)
				nextMonth = '0' + (nextDate.getMonth()+1);
			else
				nextMonth = nextDate.getMonth()+1;
			if(nextDate.getDate()<10)
				nextDay = '0' + nextDate.getDate();
			else
				nextDay = nextDate.getDate();
			nextYear = nextDate.getFullYear();
			var nextExist = false;

            for(var j = 0; j < temp.length; j++)
                if(temp[j].key == '/irclogs/&yet-'+nextYear+'-'+nextMonth+'-'+nextDay+'.html')
                    nextExist = true;
            if(nextExist)
            {
                logFile.push('          <button align="right" onclick="window.location.href=\''+newPath+nextMonth+'-'+nextDay+'-'+nextYear+'.html\'">Next log</button>');
                nextDone = true;
            }
			else
				nextDate.setDate(nextDate.getDate()+1);
			if(nextMonth+"/"+nextDay+"/"+nextYear==curMonth+"/"+curDay+"/"+curYear)
				nextDone=true;
		}



        //date.toLocaleTimeString() //For getting the time. It'll be on the furthest right part of the message area.
        //overflow-y:scroll; <-- for the second sidebar that will have the drop down list of dates.


        logFile.push('      </div>');
		//Next, the actual stuff in the log gets parsed
        var fileStr;
        //This took way to long to figure out. This essentially creates a gray transparent background to seperate names/actions.
        logFile.push('<div style="width:300px; height:5000px; background-color:rgba(195, 195, 195, 0.4); position:fixed; top:0px; left:0px"></div>');
        var tempArray = [];//This is where the paragraphs for the data are made. They are added last, though
        s3Store.getObject('static.andyet.com/irclogs', '%26yet-'+strYear+'-'+strMonth+'-'+request.params.file.substring(3,5)+'.log', function _responseObject(err, response, fileBuf) {
            fileStr = fileBuf.toString().split('\n');
            var currentUser; //For long chains of user actions
            var nameChange = false; //Determines if another user makes an action
            for(var i = 0; i < fileStr.length; i++)
            {
                var date = new Date(fileStr[i].substring(0,19))
                var userN = '';
                if(fileStr[i].substring(20,24) == 'msg ')
                {
                    var done = false;
                    var msgStart = 0;
                    if(fileStr[i].substring(25,30) == ' ybot')//ybot has an extra space before its name
                    {   msgStart = 30;
                        userN = 'ybot';
                        if(currentUser == userN)
                            nameChange = false;
                        else
                        {
                            nameChange = true;
                            currentUser = userN;
                        }
                    }
                    if(fileStr[i].substring(25,30) != ' ybot')
                        for(var j = 25; j < fileStr[i].length; j++)
                        {
                            //Assuming no spaces are allowed for names, this should work.
                            if(fileStr[i].charAt(j) != ' ' && done == false)
                                userN += fileStr[i].charAt(j);
                            //Checks for false due to spaces in the actual message
                            //Otherwise, only the last word is displayed
                            if(fileStr[i].charAt(j) == ' ' && done == false)
                            {   done = true;
                                msgStart=j+1;
                                if(currentUser == userN)
                                    nameChange = false;
                                else
                                {
                                    nameChange = true;
                                    currentUser = userN;
                                }
                            }
                        }
                    if(nameChange == true)
                    {
                        tempArray.push('            <p><div class="name ' + userN.length + '"><em style="color:'+getColor(userN)+';">'+userN+'</em></div><div class="msg">'+fileStr[i].substring(msgStart,fileStr[i].length)+'</div></p>');
                    }
                    else
                    {
                        tempArray.push('            <p><div class="name"></div><div class="msg">'+fileStr[i].substring(msgStart,fileStr[i].length)+'</div></p>');
                    }
                }
                if(fileStr[i].substring(20,24) == 'join')
                {
                    var done = false;
                    for(var j = 25; j < fileStr[i].length; j++)
                    {
                        if(fileStr[i].charAt(j) != ' ' && done == false)
                            userN += fileStr[i].charAt(j);
                        if(fileStr[i].charAt(j) == ' ')
                            done = true;
                    }
                    tempArray.push('                <p class="join"><em style="color:'+getColor(userN)+';">' + userN + '</em> <em style="color:blue;">joined</em> the IRC channel.</p>');
                }
                if(fileStr[i].substring(20,24) == 'nick')
                {
                    var done = false;
                    var nameStart = 0;
                    for(var j = 25; j < fileStr[i].length; j++)
                    {
                        if(fileStr[i].charAt(j) != ' ' && done == false)
                            userN += fileStr[i].charAt(j);
                        if(fileStr[i].charAt(j) == ' ' && done == false)//Checks for false in due to spaces in the message
                        {   done = true;
                            nameStart=j+17;}
                    }
                    tempArray.push('                <p class="nick"><em style="color:'+getColor(userN)+';">' + userN + '</em> is now known as <em style="color:'+getColor(fileStr[i].substring(nameStart,fileStr[i].length))+';">' +
                                   fileStr[i].substring(nameStart,fileStr[i].length) + '</em>.</p>');
                }
                if(fileStr[i].substring(20,24) == 'quit' || fileStr[i].substring(20,24) == 'part')//I found a few files that use "part"
                {
                    var done = false;
                    var nameStart = 0;
                    for(var j = 25; j < fileStr[i].length; j++)
                    {
                        if(fileStr[i].charAt(j) != ' ' && done == false)
                            userN += fileStr[i].charAt(j);
                        if(fileStr[i].charAt(j) == ' ' && done == false)//Checks for false in due to spaces in the message
                        {   done = true;
                            nameStart=j+17;}
                    }
                    tempArray.push('                <p class="quit"><em style="color:'+getColor(userN)+';">' + userN + '</em><em style="color:blue;"> left</em> the IRC channel.</p>');
                }
                if(fileStr[i].substring(20,24) == 'act ')
                {
                    var done = false;
                    var actStart = 0;
                    if(fileStr[i].substring(25,30) == ' ybot')//ybot has an extra space before its name
                    {       actStart = 30;
                           userN = 'ybot';}
                    else
                        for(var j = 25; j < fileStr[i].length; j++)
                        {
                            //Assuming no spaces are allowed for names, this should work.
                            if(fileStr[i].charAt(j) != ' ' && done == false)
                                userN += fileStr[i].charAt(j);
                            //Checks for false due to spaces in the actual message
                            //Otherwise, only the last word is displayed
                            if(fileStr[i].charAt(j) == ' ' && done == false)
                            {       done = true;
                                    actStart=j+1;}
                        }
                    tempArray.push('                <p class="act"><em style="color:'+getColor(userN)+';">' + userN +
                                   '</em><em style="color:blue;">' + fileStr[i].substring(msgStart,fileStr[i].length)+'</em></p>');
                }
            }
            //That wasn't so bad.






            //Now we have the getColor method, which returns the user's color based on the first character of their name.
            //This can be changed if needed, but I feel it can be useful when looking for a specific user. 
            //Even though Cmd+F does the trick. Whatever. It looks pretty.
            //Yellow is a no-no. Too difficult to see the name.
            function getColor(name)
            {
                switch(name.charAt(0).toUpperCase())
                {
                    case 'A': return '#FF0000'; break; //Red
                    case 'B': return '#00FF00'; break; //Green
                    case 'C': return '#0000FF'; break; //Blue
                    case 'D': return '#CCCC00'; break; //Dark Yellow
                    case 'E': return '#00FFFF'; break; //Cyan
                    case 'F': return '#FF00FF'; break; //Magenta
                    case 'G': return '#800000'; break; //Dark red
                    case 'H': return '#00FFCC'; break; //Sea green
                    case 'I': return '#660099'; break; //Violet
                    case 'J': return '#FF6633'; break; //Orange
                    case 'K': return '#FF66FF'; break; //Pink
                    case 'L': return '#6699FF'; break; //Light purple
                    case 'M': return '#00CCFF'; break; //Sky blue
                    case 'N': return '#66CC00'; break; //Grass green
                    case 'O': return '#AFEEEE'; break; //Pale turquoise
                    case 'P': return '#4B0082'; break; //Dark purple
                    case 'Q': return '#000080'; break; //Navy blue
                    case 'R': return '#228B22'; break; //Forest green
                    case 'S': return '#FF4500'; break; //Scarlet
                    case 'T': return '#A0522D'; break; //Brown
                    case 'U': return '#4682B4'; break; //Steel blue
                    case 'V': return '#2F4F4F'; break; //Dark gray-blue
                    case 'W': return '#00FF00'; break; //Lime green
                    case 'X': return '#8B008B'; break; //Dark magenta
                    case 'Y': return '#9932CC'; break; //Orchid
                    case 'Z': return '#FF69B4'; break; //Dark pink
                    default: return '#000000'; break;  //Black
                }

            }




            //Formatting the calendar, next/prev buttons, and list of dates
            logFile.push('<style>',
                         'TABLE.calendar {text-align:right;}',
                         'div button {float:right;}',
                         '</style>');





            //Formatting the user names and all the actions to fit within a specific area
            logFile.push('<style>',
                         'div.name {text-align:right;}',
                         'div.msg {text-align:left; margin-left: 310px; margin-right:290px;}',
                         'p.join {margin-left:310px; margin-right:290px;}',
                         'p.quit {margin-left:310px; margin-right:290px;}',
                         'p.nick {margin-left:310px; margin-right:290px;}',
                         'p.act {margin-left:310px; margin-right:290px;}',
                         '</style>');





            //Then the checkboxes for displaying specific actions. Also for various jQuery code segments.
            logFile.push('          <form>',
                         '          <input type="checkbox" id="msgChk">Hide messages<br>',
                         '          <input type="checkbox" id="actChk">Hide action logging<br>',
                         '          <input type="checkbox" id="nickChk">Hide name changes<br>',
                         '          <input type="checkbox" id="quitChk">Hide quit actions<br>',
                         '          <input type="checkbox" id="joinChk">Hide join actions<br>',
                         '          </form>',
                         '         <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>',
                         '          <script>',
                         '              $(document).ready(function(){',
                         '                  var nameLength = $(\'div.name\').attr(\'class\').split(\' \')[1]',
                         '                  var width = $(window).width()',
                         '                  var nameWidth = (width-290) + "px";',
                         '                  var buttonPos = (width-290) + "px";',
                         '                  $(\'div.calAndLists\').css({\'left\': buttonPos})',
                         '                  $(\'div.name\').css({\'margin-right\': nameWidth})',
                         '                  $(\'#msgChk\').click(function () {$(".msg").toggle(); $(\".name\").toggle();})',
                         '                  $(\'#actChk\').click(function () {$(".act").toggle();})',
                         '                  $(\'#nickChk\').click(function () {$(".nick").toggle();})',
                         '                  $(\'#quitChk\').click(function () {$(".quit").toggle();})',
                         '                  $(\'#joinChk\').click(function () {$(".join").toggle();});',
                         '              });',
                         '          </script>');
            logFile = logFile.concat(tempArray);//Pushes in all of the paragraphs for the log itself
            logFile.push(' </body>', '</html>');
           //And last we return it like an html file
           reply(logFile.join('\n'));
        });
	});}
});

server.start(function () {
    console.log('Server running at:', server.info.uri);
});

//TODO
//Create a drop down list of dates. It should allow the user to open the list by year, then by month, and then by date. A calendar should exist for quick reference. The next/prev buttons should also be kept
//Also, have the list automatically drop down the year/month that the log is currently opened to.
//Figure out the scroll stuff (Where a user can scroll up/down and if it reaches the top/bottom, it will load the next/previous log). Last priority for now. The calendar/list of dates will suffice.
//Set the name's left margin to 290px minus the name's length for pixels. Set the message's left margin to 20px and the right to 310. Then make them all part of one line (display:inline;)