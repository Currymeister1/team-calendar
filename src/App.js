import format from "date-fns/format";
import getDay from "date-fns/getDay";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./App.css";
import raw from "../src/dummy-roster.txt";
import { Views } from "react-big-calendar";
import html2canvas from 'html2canvas';
import { saveAs } from "file-saver";

const locales = {
  "en-US": require("date-fns/locale/en-US")
}
const localizer = dateFnsLocalizer( {
  format,
  parse,
  startOfWeek,
  getDay,
  locales
})

const events = []

async function loadNames() {
  const text = await fetch(raw).then(r => r.text());
  const names = text
    .split("\n")
    .map(n => n.trim())
    .filter(Boolean);

  return names;
}

function exportToImage() {
  console.log("Hi")
   html2canvas(document.querySelector("#calendar-container")).then(canvas => {
        canvas.toBlob(function(blob) {
          saveAs(blob, 'my_image.jpg');
        });
      });
 }

function App() {
  const [newEvent, setNewEvent] = useState({title: "", start: "", end: ""})
  const [allEvents, setAllEvents] = useState(events)
  const [names, setNames] = useState([])

  
  useEffect(() => {
  async function go() {
    const list = await loadNames();
    setNames(list);
  }
  go();
}, []);

  function handleEndDate(newEvent) {
    if(+newEvent.start !== +newEvent.end) {
      console.log(newEvent.end)
      const next = new Date(newEvent.end)
      next.setDate(newEvent.end.getDate() + 1)
      console.log(next)
      return next
    }
    return newEvent.end
  }

  function handleAddEvent() {
    setAllEvents([...allEvents, newEvent])
  }

  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  
  return (
    <div className="App">
      <h1>Calendar</h1>
      <h2>Add new Event</h2>
      <span> 
         <select value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})}>
            <option value="">Pick a name</option>
            {names.map((n, i) => (
              <option key={i} value={n}>{n}</option>
            ))}
        </select>
         <DatePicker placeholderText="Start Date" 
          style={{margin: "5px", display: "grid"}}
          selected={newEvent.start} 
          onChange={(start) => setNewEvent({...newEvent, start})} 
          />
        <DatePicker placeholderText="End Date"
        selected={newEvent.end} onChange={end => setNewEvent({...newEvent, end})} />
        <button style={{marginTop: "10px"}} onClick={handleAddEvent}>Add Event</button>
      </span>
    <div id="calendar-container" className="calendar-container">
       <Calendar 
      localizer={localizer} 
      events={allEvents} 
      views={[Views.MONTH, Views.WEEK, Views.DAY]}
      defaultView={view}
      view={view} 
      date={date} 
      onView={(view) => setView(view)}
      onNavigate={(date) => {
      setDate(new Date(date));
      }}
      startAccessor="start"
      showAllEvents={true}
      endAccessor={(newEvent) => handleEndDate(newEvent)} 
      style={{height: 600,margin: "60px" }}></Calendar>
    </div>
    <div>
      <button onClick={exportToImage}>Download</button>
    </div>
    </div>
  );
}

export default App;
