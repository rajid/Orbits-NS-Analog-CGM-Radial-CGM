

function HelloWorld(props) {

    return (
        
        <Page>
          <Text>Note: This software has been tested to best of my abilities, however some bugs
            may still be present.  Please make sure you have some other method of receiving a warning
            of Urgent Low BG values.
          </Text>

          <Text>Configuration can be copy/pasted as well as saved and restored between other CGM/NS
            watchfaces by this same author.
            (See end of Configuration sections, before "General operation notes")</Text>

          <Text>Some general notes on how the watch face displays information are included
            at the end of this configuration page.</Text>
          <Text>(Scroll to end for Release Notes)</Text>
          <Section title={<Text bold align="center">Periodic comet settings:</Text>}>
            <Text>A red dot can be setup to appear on the watch face after a set period of time.
              This can be useful as a reminder of cannula or sensor changes.
              When the "reset periodic event" button is pressed, the dot will disappear and will
              reappear after a set number of days.
              The reappearance time can be configured to happen a set number of hours before,
              in order to give notice of the upcoming event.</Text>
            <Button
              label="Touch here to reset periodic event marker now"
              onClick={() => { props.settingsStorage.setItem("change", JSON.stringify("now"))}} />
              <TextInput fill="lightblue" settingsKey="changeDate" label="Manually override comet reset time: MM/DD/YYYY HH:MM" type="datetime" />
              <TextInput settingsKey="cometDays" label="Reappear after X days" type="text" />
              <TextInput settingsKey="cometHours" label="Reappear X hours before the event" type="text" />
              <Text  align="center">URL to receive comet reset time:</Text>
              <Text>If a URL is supplied here, it will accessed at the time when the comet is reset.
                Make sure to use the "https" version of the URL.  
                If the URL contains "&lt;c&gt;", this will be substituted with the comet reset date and time,
                in the form "MM/DD/YYYY HH:MM:SS "AM" or "PM", followed by
                the offset from GMT; e.g. "05/11/2018 10:00:00 AM -0800".</Text>
              <TextInput settingsKey="cometURL" label="URL for comet reset" type="text" />
              <Text>When performing a procedure, such as sensor or cannula change, some people
                prefer an initial timer for various purposes. The follow configures a simple minute
                timer which counts down, followed by a notification vibration.</Text>
              <TextInput settingsKey="timer" label="Timer at reset time (minutes)" type="text" />
          </Section>

          
          <Section title={<Text bold align="center">Nightscout Configuration:</Text>}>
            <Text>If you are running your Nightscout uploading program on the same phone as your
              Fitbit application, and if your Nightscount uploader supports "Local mode", then
              simply turning on this toggle may be all that's needed.  (This uses the fetch
              URL "http://127.0.0.1:1979", which is correct for Spike.)
            </Text>
            <Toggle settingsKey="local" label={`Use Local Mode: ${props.settings.local === 'true'?'On':'Off'}`}/>
            { props.settings.local === 'true' &&
                <Section>
        <Text>After selecting "local mode", select either the XDrip+ or the Spike version, depending upon
          which program you are running on your phone.</Text>
              <Toggle settingsKey="localapp" label={`Use Local Mode: ${props.settings.localapp === 'true'?'xDrip+':'Spike'}`}/>
                  </Section>
        }

            <Text>If you are using Nightscout, you can configure your base URL here.
              This turns on the BG monitoring feature.  Make sure to use the "https" version
              of the URL.  (If the status dot,
              in the upper-right, doesn't change to green, then most likely the communication
              between the phone and watch is down; see "Status Dot", near the end of this page.
              If the status dot changes to green but you still see no number in the lower-left
              or arrow in the lower-right, then either your URL is incorrect or your NightScout
              page has old data.)
            </Text>
            <TextInput settingsKey="url" label="eg. https://name.herokuapp.com" type="text" />

            <Text>If you are using a Nightscout token, you can configure that here.  If you
              don't have a token or don't know what this is about, then just leave it blank.
            </Text>
            <TextInput settingsKey="token" label="eg. name-123456789ABCDEF" type="text" />

            <Text>Minimum update interval.  The watch face will automatically calculate the best
              update interval.  This minimum value is intended for use by a secondary person who may want to
              monitor with less frequent updates, such as 10.</Text>
            <TextInput label="Min. update interval" settingsKey="minUpdate" type="text" />

            <Toggle settingsKey="units" label={`Units: ${props.settings.units === 'true' ? 'mmol/L' : 'bg/dL'}`}/>

          </Section>
          <Section title={<Text bold align="center">BG Low & High limits:</Text>}>
            <Text>Without BG low and high limits, the watch face will not fetch new information
              unless the screen is on.  Setting limits will force the watch face to wakeup and
              fetch new information regularly regardless.
              When a BG low or high alarm occurs, it may be suppressed for various time periods
              (see below).</Text>
            <TextInput settingsKey="urgentLow" label="BG Urgent Low limit" type="text" />
            <TextInput settingsKey="low" label="BG Low limit" type="text" />
            <TextInput settingsKey="high" label="BG High limit" type="text" />
            <TextInput settingsKey="urgentHigh" label="BG Urgent High limit" type="text" />
            <Text>Settings for receiving a BG warning if the change in values between fetches
              is bigger than a configured amount.
              This can provide additional early warning for rapid rise of fall of BG values.</Text>
            <TextInput settingsKey="diff" label="BG difference notification"/>
            <Text>Sometimes, the BG value may change quite a lot over a longer period of time,
              however each update will not show up as a big change.  (For example, if the value changed
              by -5 every 5 minutes, this could add up to a change of -30 over only a half hour!)
              The next two values are meant to address this; they are the period over which to look
              for a change and the amount of change (positive or negative) to look for.  If this change
              happens over the configured time period, you will receive a buzz notification and
              the arrow color will be changed to yellow to indicate the cause of the warning.</Text>
            <TextInput label="Long term alarm period (min)" settingsKey="longPeriod" type="text" />
            <TextInput label="Long term alarm difference" settingsKey="longDiff" type="text" />
            <Text>This configuration allows the BG number, in the lower-left corner, to be made
              bigger, for better visibility.</Text>
            <TextInput label="Font size for BG number" settingsKey="bgFont1" type="text" />
            <Text>The following colors may be used in order change the color of the BG number under
              the circumstances mentioned.  This may allow the range to be more quickly determined,
              especially if sight is hampered by blurriness (such as in the morning).
              The color is also used when displaying a BG warning message.</Text>
            <Text>(All <Link source="https://dev.fitbit.com/build/guides/user-interface/css/#web-color-names">'Web Standard' color names</Link> should work.  Names should not have a space, e.g. "lightgreen".
              Keep in mind the color should contrast well against black.
              If the color isn't recognized, then white will be used instead.)</Text>
            <TextInput label="Urgent Low Color" settingsKey="urgentLowColor" type="text"/>
            <TextInput label="Low Color" settingsKey="lowColor" type="text"/>
            <TextInput label="In Range Color" settingsKey="inRangeColor" type="text"/>
            <TextInput label="High Color" settingsKey="highColor" type="text"/>
            <TextInput label="Urgent High Color" settingsKey="urgentHighColor" type="text"/>
            <Text>This configuration suppresses vibration notifications, for minor events and for
              communication channel loss, during a period, such as sleep time.
              (Note that if communication between the watch and the phone is lost and can not be
              automatically reset by an auto-restart (see below), then suppressing warnings here will
              mean that your watch will simply sit waiting for something to happen and there will be
              no vibration warning.)
              (Setting the end time to 1 minutes before the start time,
              will result in effectively disabling all extra warnings pretty much all of the time.)
            </Text>
            
            <TextInput settingsKey="warn-start" label="Quiet Start HH:MM (24hr)" type="text" />
            <TextInput settingsKey="warn-end" label="Quiet End HH:MM (24hr)" type="text" />
            <Text>Only give me Urgent High and Urgent Low warnings during the above 'Quiet Time' period.
              (Note: you will NOT receive a buzz notification for Low or High warning messages during the Quiet Time, but you
              WILL receive a buzz notification for Urgent Low and Urgent High messages.)</Text>
            <Toggle settingsKey="urgent" label={`Only Urgent warnings: ${props.settings.urgent === 'true' ? 'On' : 'Off'}`}/>
          </Section>

          <Section title={<Text bold align="center">Watch Face settings:</Text>}>
              <TextInput settingsKey="gradient" label="Gradient background color (lowercase)" type="text" />
              <TextInput settingsKey="hour" label="Hour hand color" type="text" />
              <TextInput settingsKey="minute" label="Minute hand color" type="text" />
              <TextInput settingsKey="second" label="Second hand color" type="text" />
              <Toggle settingsKey="seconds" label={`Display second hand ${props.settings.seconds === 'true' ? 'On' : 'Off'}`}/>
          </Section>

          <Section title={<Text bold align="center">Daily Alarms:</Text>}>
            <Text>Many diabetics will require pills at set times every day.
              This set of alarms will occur every day at the same time.
              When they occur, a "snooze" button is provided with configurable snooze times
              (see below).</Text>
          </Section>
          <Section title={<Text align="left">Daily Alarm 1:</Text>}>
            <TextInput settingsKey="alarm0" label="HH:MM (24hr)" type="text" />
            <TextInput settingsKey="mess0" label="Message" type="text" />
          </Section>
          <Section title={<Text align="left">Daily Alarm 2:</Text>}>
            <TextInput settingsKey="alarm1" label="HH:MM (24hr)" type="text" />
            <TextInput settingsKey="mess1" label="Message" type="text" />
          </Section>
          <Section title={<Text align="left">Daily Alarm 3:</Text>}>
            <TextInput settingsKey="alarm2" label="HH:MM (24hr)" type="text" />
            <TextInput settingsKey="mess2" label="Message" type="text" />
          </Section>
          <Section title={<Text align="left">Daily Alarm 4:</Text>}>
            <TextInput settingsKey="alarm3" label="HH:MM (24hr)" type="text" />
            <TextInput settingsKey="mess3" label="Message" type="text" />
          </Section>
          <Section title={<Text align="left">Daily Alarm 5:</Text>}>
            <TextInput settingsKey="alarm4" label="HH:MM (24hr)" type="text" />
            <TextInput settingsKey="mess4" label="Message" type="text" />
          </Section>
          <Section title={<Text align="left">Daily Alarm 6:</Text>}>
            <TextInput settingsKey="alarm5" label="HH:MM (24hr)" type="text" />
            <TextInput settingsKey="mess5" label="Message" type="text" />
          </Section>
          <Section title={<Text align="left">Daily Alarm 7:</Text>}>
            <TextInput settingsKey="alarm6" label="HH:MM (24hr)" type="text" />
            <TextInput settingsKey="mess6" label="Message" type="text" />
          </Section>
          <Section title={<Text align="left">Daily Alarm 8:</Text>}>
            <TextInput settingsKey="alarm7" label="HH:MM (24hr)" type="text" />
            <TextInput settingsKey="mess7" label="Message" type="text" />
          </Section>
          <Section title={<Text align="left">Daily Alarm 9:</Text>}>
            <TextInput settingsKey="alarm8" label="HH:MM (24hr)" type="text" />
            <TextInput settingsKey="mess8" label="Message" type="text" />
          </Section>
          <Section title={<Text align="left">Daily Alarm 10:</Text>}>
            <TextInput settingsKey="alarm9" label="HH:MM (24hr)" type="text" />
            <TextInput settingsKey="mess9" label="Message" type="text" />
          </Section>

          <Section title={<Text align="left">Default Alarm Msg Snooze time:</Text>}>
            <Text align="left">
              A default snooze time can be configured, such that touching on the
              message itself will automatically snooze for that number of minutes.
              If none ("0") is configured, then touching on the message does nothing.
            </Text>
            <TextInput settingsKey="defAlmSz" label="minutes" type="text" />
          </Section>

          <Section title={<Text align="left">Alarm Msg Snooze times:</Text>}>
            <TextInput settingsKey="alarmsnooze0" label="minutes" type="text" />
            <TextInput settingsKey="alarmsnooze1" label="minutes" type="text" />
            <TextInput settingsKey="alarmsnooze2" label="minutes" type="text" />
            <TextInput settingsKey="alarmsnooze3" label="minutes" type="text" />
            <TextInput settingsKey="alarmsnooze4" label="minutes" type="text" />
            <TextInput settingsKey="alarmsnooze5" label="minutes" type="text" />
            <TextInput settingsKey="alarmsnooze6" label="minutes" type="text" />
            <TextInput settingsKey="alarmsnooze7" label="minutes" type="text" />
          </Section>

          <Section title={<Text align="left">Default BG Alarm Msg Suppress time:</Text>}>
            <Text align="left">
              A default suppression time can be configured, such that touching on the
              message itself will automatically snooze for that number of minutes.
              If none ("0") is configured, then touching on the message does nothing.
              Note, this is only effective for "low" and "high" warnings, not
              "urgent low" and "urgent high".
              (If no urgent low or high values are configured, then the configure low and high
              values are treated as urgent.)
            </Text>
            <TextInput settingsKey="defBgSz" label="minutes" type="text" />
          </Section>

          <Section title={<Text align="left">BG Alarm Msg Suppress times:</Text>}>
            <TextInput settingsKey="bgsnooze0" label="minutes" type="text" />
            <TextInput settingsKey="bgsnooze1" label="minutes" type="text" />
            <TextInput settingsKey="bgsnooze2" label="minutes" type="text" />
            <TextInput settingsKey="bgsnooze3" label="minutes" type="text" />
            <TextInput settingsKey="bgsnooze4" label="minutes" type="text" />
            <TextInput settingsKey="bgsnooze5" label="minutes" type="text" />
            <TextInput settingsKey="bgsnooze6" label="minutes" type="text" />
            <TextInput settingsKey="bgsnooze7" label="minutes" type="text" />
          </Section>
          
          <Section title={<Text bold align="center">Copy/Paste Configuration:</Text>}>
            <Text align="left">
              The follow text string is a saveable copy of the entire current configuration
              of this watch face.  You can copy & paste this configuration in order to
              migrate to one of my other CGM/NS related watch faces
              ("Orbits NS", "Analog CGM", "Radial CGM"), or to simply switch
              to another watch face without the need to go through the entire configuration
              process again when/if you come back.
            </Text>
            <TextInput settingsKey="config" label="Configuration:" type="text" />

          <Text>Use the following buttons to Save into a common area, or to Restore from the common area.
            This allows quick migration of configuration between the
            watch faces "Orbits NS", "Analog CGM", and "Radial CGM".
            </Text>
            <Text align="center" >
              <Button label="Save configuration" onClick={() => {props.settingsStorage.setItem("import", "0")}} />
            </Text>
            <Text align="center" >
                <Button label="Restore configuration" onClick={() => {props.settingsStorage.setItem("import", "1")}} />
                  {typeof(props.settings.import) !== 'undefined' && <Text align="center">Updating...</Text> }
            </Text>

          </Section>

          <Section title={<Text align="center">General operation notes:</Text>}>
            <Text align="left" bold>Reading the time and date:</Text>
            Read the hour by looking a the position of the earth with respect to the sun.
            Read the minutes by looking at the position of the moon with respect to the earth.
            Read the day of the week by looking at the position of the comet with respect to the sun.

            (The asteroid revolves around the sun every week, with Sunday at the top, so the first half
            of the week [Monday, Tuesday, Wednesday] it will be on the right and second half
            of the week [Thursday, Friday, Saturday] it will be on the left.)
            <Text>
              Touch anywhere on the display in order to display Month and Date in the top-left and top-right
              corners, respectively, and the Hour and Minute (in 24 hour format) in the bottom-left
              and bottom-right corners, respectively.
            </Text>
            
            <Text align="left" bold>Battery power level:</Text>
            Battery level is indicated by the length of the sun's rays.

            <Text align="left" bold>Daily alarms:</Text>
            Up to ten daily alarms with associated notes may be configured.  They will each automatically
            reschedule for the next day upon being dismissed.  They can each be snoozed for various amounts
            of time and the set of possible snooze times is configurable.
            
            
          </Section>
          <Section title={<Text align="center">NightScout related notes:</Text>}>
            <Text align="left" bold>Blood Glucose value display:</Text>
            The sensor blood glucose value is displayed in the lower-left of the screen.
            The number will gradually fade over time, to indicate the usefullness of the value.
            When an update occurs, the number will be refreshed.
            (The general rule is, if you can't read the number, then it's so old that it isn't
            representative anyway and shouldn't be used!)
            Touching the blood glucose value number will display a graph (see below) of the last 24 values.
            
            <Text align="left" bold>Status dot (upper-right):</Text>
            The dot in the upper-right indicates the status of the connection between the watch and the phone.
            The dot will be white if status is indeterminate (no communication has been attempted).
            This is the usual case when the watch face has just started.
            The dot should almost immediately turn green to indicate that a message has been correctly sent to the phone.
            If the dot stays white, it probably means that the communication channel to the phone was not initialized correctly.
            This can sometimes happen when switching apps on the watch very quickly.  Just restart the app on the watch.
            (Do this by pressing and holding the "back" button and the "down" buttons simultaneously, until the screen goes black,
            then immediately release them.  [Holding them both longer will force-restart the entire watch.])
            The dot will turn red if one or more messages to the phone were not sent correctly.
            This means the communication channel is down.  Many times simply restarting the app will reset things
            (see "Auto-restart functionality", below).
            If not, check to make sure the Fitbit app is actually running on your phone (iPhones have a bad habit of
            removing programs from memory sometimes).
            If you have restarted the app on the watch, have verified the Fitbit app is running on the phone, and that
            the bluetooth connection to the phone is up, then force-quit and restart the Fitbit app on the phone.

            <Text align="left" bold>Direction arrow:</Text>
            A directional arrow appears in the lower-right.  The arrow indicates the difference between
            the current value and the previous value.
            If the current value is the result of a recalibration, the arrow will change to two
            arrows pointing at each other and a vibration notification will occur.

            <Text align="left" bold>Glucose alarms:</Text>
            When a low or high glucose alarm occurs, the alarm can be suppressed for various
            amounts of time.  A graph can also be displayed of the last 24 values.
            
            Glucose high and low limit suppressions are automatically cancelled once the glucose value
            has crossed back toward normal values.

            When an Urgent High or Urgent Low suppression is set, the corresponding non-urgent limit suppression
            is also set.  This prevents additional warnings as the glucose value progresses back toward
            normal values.  Otherwise, for example, when recovering from an Urgent Low, an additional Low
            warning would possibly be presented unnecessarily.
            
            <Text align="left" bold>Glucose high and low limits:</Text>
            If low and/or high glucose limits are set, then the companion application running
            on the phone will automatically fetch glucose information at set intervals.  If no
            limits are set, then the watch face will trigger fetching information after the
            update interval has expired, but will not do so if the screen is off.  When the screen
            comes back on, the update interval is consulted and a fetch will be initiated, if needed.
            
            <Text align="left" bold>Graph:</Text>
            The graph displays the previous 24 glucose values.  If the watch face has been running 
            long enough to have 24 values, then the graph is displayed immediately.
            If not, it will take a few seconds to retrieve the latest information, the first time.

            <Text align="left" bold>Auto-restart functionality</Text>
            If the watch and phone loose the communication channel for any reason, and if a BG High or BG Low limit
            is set, this is considered to be an important event and is brought to the attention of the wearer.
            If "comm suppression" is currently in effect, such as during the "Quiet Time" configured, or even if
            "comm suppression" for a set time period was set on the watch using the menu item, then the watch will
            try to automatically correct the situation by automatically restarted the watch face.
            If restarting the watch face doesn't result in the communication channel returning, such as if the
            watch and phone are out of bluetooth range or the Fitbit app on the phone is not running, then the
            watch will not auto-restart again.  No further auto-restarts will be attempted until the communication
            channel has been re-acquired and then lost again.

            <Text align="left" bold>Menu items</Text>
            The menu icon on the upper-left of the main screen, brings up a menu of items which should not
            be needed most times.
            
            "redo last alarm" - if you accidentally cleared the last daily alarm
            and simply need to bring it back in order to snooze it instead.

            "snooze comm warnings" - This silences notifications about loss
            of communication between the watch and the phone, as well as other minor events (recalibration, reading an old
            BG value from Nightscout).
            For example, if you are swimming and thus the bluetooth
            connection would be lost while you are in the water, it would be convenient to snooze that warning during
            your swim time.  You will not receive warnings about problems reading BG values.  Note, this also means
            that high and low BG alarms will not happen, since you are not reading BG values while in the water.
            The watch will still try to correct the communication problem by auto-restarting the watch face, but then
            will see that an auto-restart didn't help.  Normally it would then notify you, but suppressing comm warnings
            means the watch will just sit awaiting a correction of the problem, with no notification.
            You can terminate the snooze early by selecting the "Cancel Suppressions" menu item.
            
            "Current Suppressions" - Will list any currently active suppressions or snoozes.
            
            "Cancel Suppressions" - Will cancel all currently active suppressions.  This includes BG high and low
            suppressions as well as "comm" suppressions, but does not affect an alarm snooze.

              "Reset Interval" - Will reset the periodic event marker from the watch.
              This is especially useful when the Fitbit app on the phone has no Internet connection.
              The functionality is exactly the same as entering Settings and touching on
              "Touch here to reset periodic event marker now".
          </Section>
          <Section title={<Text align="center">Release Notes:</Text>}>
            <Text align="left" bold>1.4.1</Text>
            <Text>
              Buzz for any received BG value less than 40 mg/dl.
              Introduced xDrip+ "local/offline" mode configuration toggle.
            </Text>
            <Text align="left" bold>1.4.2</Text>
            <Text>
              Simplified the alarm buzz so it's more regular.
              Reduced memory usage in various places.
              Introduced a way to copy/paste all settings.
              All BG warning snoozes will now automatically clear once
              the BG level has crossed more than 1 mg/dl back over the limit.
              Allow touching on high & low warnings (but not urgent ones)
              to snooze for a configured default time.
              (since they will now auto-reset once back in range).
              Fixed testing of "long term alarms" re. calibrations.
              Calibrations now show as a large dot on the graph.
            </Text>
            <Text align="left" bold>1.4.4</Text>
            <Text>
            Fixed problem with where a BG value of "0" would be displayed if there was a network access error. Fixed problem where calibration symbol would be displayed along with the arrow and graph of calibration point would not be represented correctly.
            </Text>
            <Text align="left" bold>1.4.5</Text>
            <Text>
              Automatically convert all color names to lowercase. Guarantee that Nightscout URL begins with "https:". Rebuilt for latest SDK and Versa 2. Fix bug in local mode if nightscout URL is not set.
            </Text>
            <Text align="left" bold>1.5.0</Text>
            <Text>
Allow watchface to restart, if needed, when the "update" button is pressed.
Correctly keep track of changes to the graph data when removing old entries.
New "Save configuration" and "Restore configuration" buttons to allow
migration of settings between analog-cgm, orbits-ns, and radial-cgm.
            </Text>
            <Text align="left" bold>1.6.0</Text>
            <Text>
Introduced new "Reset Interval" menu item.
Companion code on phone now checks for low phone/cgm battery and will notify via a message on the watch.
Fixed some minor bugs with display and updating alarms & snoozes.
            </Text>
              
          </Section>

        </Page>
  );

}

registerSettingsPage(HelloWorld);
