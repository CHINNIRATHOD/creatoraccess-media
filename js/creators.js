const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("keyup", function(){

let filter = searchInput.value.toLowerCase();
let cards = document.querySelectorAll(".creator-card");

cards.forEach(card => {

let text = card.innerText.toLowerCase();

if(text.includes(filter)){
card.parentElement.style.display = "block";
}else{
card.parentElement.style.display = "none";
}

});

});

function filterCreators(category){

let cards = document.querySelectorAll(".creator-card");

cards.forEach(card => {

if(category === "all"){
card.parentElement.style.display = "block";
}
else if(card.classList.contains(category)){
card.parentElement.style.display = "block";
}
else{
card.parentElement.style.display = "none";
}

});

}
