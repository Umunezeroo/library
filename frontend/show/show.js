
const navContainer = document.getElementById('nav-container');


const navLinks = [
    {
        label:'Dashboard',
        active: true,
        link:'/dashboard'

    },
    {
        label:'Books',
        active: false,
        link:'/books'

    }
]

// function displayNavLinks(){

// }


export const displayNavLinks = ()=>{
    navLinks.map((nav,i)=>{
        const ul = document.createElement('ul')
        const li = document.createElement('li')
        const a = document.createElement('a')

        a.textContent = `${nav.label}` 
        a.href = `${nav.link}`
        
        navContainer.appendChild(ul)
        ul.appendChild(li);
        li.appendChild(a);
        
    })
    
    console.log(navLinks);
}

displayNavLinks()

