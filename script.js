let issues=[]
let currentIssues=[]

function login(){

const user=document.getElementById("username").value

if(user===""){
alert("Enter username")
return
}

localStorage.setItem("user",user)

window.location="dashboard.html"

}

if(window.location.pathname.includes("dashboard")){

fetch("https://api.github.com/repos/facebook/react/issues")

.then(res=>res.json())

.then(data=>{

issues=data
currentIssues=data

updateCounts()
displayIssues(data)

})

}

function updateCounts(){

const open=issues.filter(i=>i.state==="open").length
const closed=issues.filter(i=>i.state==="closed").length

document.getElementById("allCount").innerText=issues.length
document.getElementById("openCount").innerText=open
document.getElementById("closedCount").innerText=closed

}

function displayIssues(data){

const container=document.getElementById("issuesContainer")

container.innerHTML=""

data.forEach(issue=>{

const card=document.createElement("div")

card.className="card"

if(issue.state==="closed"){
card.classList.add("closed")
}

card.innerHTML=`

<h4>${issue.title}</h4>

<p>${issue.user ? issue.user.login : issue.author}</p>

<span class="label bug">BUG</span>
<span class="label help">HELP WANTED</span>

`

card.onclick=()=>openModal(issue)

container.appendChild(card)

})

}

function filterIssues(type){

if(type==="all"){
currentIssues=issues
}

else{
currentIssues=issues.filter(i=>i.state===type)
}

displayIssues(currentIssues)

}

function searchIssues(){

const text=document.getElementById("search").value.toLowerCase()

const filtered=currentIssues.filter(i=>i.title.toLowerCase().includes(text))

displayIssues(filtered)

}

function openModal(issue){

const modal=document.getElementById("modal")

modal.classList.remove("hidden")
modal.classList.add("flex")

document.getElementById("modalTitle").innerText=issue.title

document.getElementById("modalDesc").innerText=issue.body || issue.desc || ""

document.getElementById("modalAuthor").innerText=
"Author: "+(issue.user ? issue.user.login : issue.author)

document.getElementById("modalDate").innerText=
issue.created_at || issue.date

}

function closeModal(){

const modal=document.getElementById("modal")

modal.classList.add("hidden")
modal.classList.remove("flex")

}


/* CREATE NEW ISSUE */

document.querySelector('button.bg-indigo-600').onclick = () => {

const title = prompt("Enter issue title:")
if (!title) return alert("Title is required!")

const desc = prompt("Enter issue description:") || ""
const author = prompt("Enter author name:") || "anonymous"

const state = prompt("Enter state (open/closed):","open")
.toLowerCase()==="closed" ? "closed":"open"

const priority = prompt("Enter priority (HIGH, MEDIUM, LOW):","LOW").toUpperCase()

const label = prompt("Enter label (BUG, HELP WANTED, ENHANCEMENT):","BUG").toUpperCase()

const id = issues.length + 1

issues.push({
id,
title,
desc,
author,
date:new Date().toLocaleDateString(),
state,
priority,
label
})

updateCounts()
displayIssues(issues)

}