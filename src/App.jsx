"use client"

import { useState } from "react"
import "./App.css"
import pokeball from "./assets/pokeball.png"
import trainer from "./assets/trainer.png"
import pokedex from "./assets/poked.png"

function App() {
  const [activePage, setActivePage] = useState("landing")

  const switchPage = (page) => {
    setActivePage(page)
  }

  return (
    <>
      <div className="main-cont">
        <div className="main-cont-overlay">
          <div className="pokeballs">
            <div className="backball1"><img src={pokeball} alt="" /></div>
            <div className="backball2"><img src={pokeball} alt="" /></div>
            <div className="backball3"><img src={pokeball} alt="" /></div>
            <div className="backball4"><img src={pokeball} alt="" /></div>
          </div>
        </div>
        {/* Landing Page */}
        <div className={`landing-container page ${activePage === "landing" ? "active" : ""}`}>
          <h1 className="title">Pokemon</h1>
          <h1 className="title1"> Gew!</h1>
          <div className="pokemon-image">
            <img
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png"
              alt="Gengar"
            />
          </div>

          <button className="start-button" onClick={() => switchPage("menu")}>
            Start
          </button>
        </div>

        {/* Menu Page */}
        <div className={`menu-container page ${activePage === "menu" ? "active" : ""}`}>
          <div className="menu-content">
            <div className="background-section">
              <div className="background-image">
                <img src={pokeball} alt="Pokeball Background" />
              </div>
              <div className="trainer">
                <img src={trainer} alt="Trainer" />
              </div>
            </div>

            <div className="menu-grid">
              <button className="menu-button" onClick={() => switchPage("pokedex")}>Pokedex</button>
              <button className="menu-button" onClick={() => switchPage("battle")}>Battle</button>
              <button className="menu-button" onClick={() => switchPage("myteam")}>My Team</button>
              <button className="menu-button" onClick={() => switchPage("history")}>History</button>
              <button className="menu-button" onClick={() => switchPage("settings")}>Settings</button>
              <button className="menu-button back-button" onClick={() => switchPage("landing")}>
                Back
              </button>
            </div>
          </div>

          
        </div>
        <div className={`page ${activePage === "pokedex" ? "active" : ""}`}>
            <img className="poked" src={pokedex} alt="" />
            <div className="pokedex">
              <div className="poke-nav">
                <button onClick={() => switchPage("menu")}>b</button>
                <div className="search-box">
                  <input type="text" name="" id="" />
                  <button></button>
                </div>
                <button>f</button>
              </div>
              <div className="poke-cont">
                <div className="navigations">
adsf
                </div>
              </div>
            </div>
          </div>

        
          <div className={`page ${activePage === "battle" ? "active" : ""}`}>
            <h1>Battle Page</h1>
            <button onClick={() => switchPage("menu")}>Back to Menu</button>
          </div>

          <div className={`page ${activePage === "myteam" ? "active" : ""}`}>
            <h1>My Team Page</h1>
            <button onClick={() => switchPage("menu")}>Back to Menu</button>
          </div>

          <div className={`page ${activePage === "history" ? "active" : ""}`}>
            <h1>History Page</h1>
            <button onClick={() => switchPage("menu")}>Back to Menu</button>
          </div>

          <div className={`page ${activePage === "settings" ? "active" : ""}`}>
            <h1>Settings Page</h1>
            <button onClick={() => switchPage("menu")}>Back to Menu</button>
          </div>
      </div>
    </>
  )
}

export default App
