import React from 'react';
import './App.css';

import BlackKing from './pieces/black-king.png';
import BlackKnight from './pieces/black-knight.png';
import BlackRook from './pieces/black-rook.png';

import WhiteKing from './pieces/white-king.png';
import WhiteKnight from './pieces/white-knight.png';
import WhiteRook from './pieces/white-rook.png';

class Piece {
  constructor(pos, colour, img, type) {
    this.pos=pos;
    this.colour=colour;
    this.img=img;
    this.type=type;
  }
}

class Game {
  constructor(){
    this.selectedPiece=null;
    this.selectedSquare=null;

    this.turn=false; //false = white .... true = black
    this.inCheck=null;

    this.pieces = [new Piece(0,true,BlackKing, "king"),
      new Piece(1,true,BlackKnight, "knight"),
      new Piece(2,true,BlackRook, "rook"),
      "",
      "",
      new Piece(5,false,WhiteRook, "rook"),
      new Piece(6,false,WhiteKnight, "knight"),
      new Piece(7,false,WhiteKing, "king")]
  }

  selectPiece(piece) {
    this.selectedPiece= (typeof piece == typeof "") ? null : piece;
    this.selectedSquare=(typeof piece == typeof "") ? null : piece.pos;
  }

  toggleTurn() {
    this.turn=!this.turn;

    this.selectedPiece=null;
    this.selectedSquare=null;
  }

  movePiece(i, f) {
    let colour = this.pieces[i].colour;

    this.pieces[f]=game.pieces[i];
    this.pieces[i]="";
    this.pieces[f].pos=f;

    if (this.isCheck(colour)) { this.inCheck=colour }
    else if (this.isCheck(!colour)) { this.inCheck=!colour }
    else { this.inCheck=null }
  }

  isCheck(colour) {
    for (let i = 0; i<this.pieces.length; i++) {
      if (this.pieces[i].colour===colour && this.pieces[i].type==="king") {
        var king = this.pieces[i];
        break;
      }
    }

    //first check for knight checks
    if (king.pos<=5) {
      if (this.pieces[king.pos+2].type==="knight"&&this.pieces[king.pos+2].colour===!colour) {
        return true;
      }
    }
    if (king.pos>=2) {
      if (this.pieces[king.pos-2].type==="knight"&&this.pieces[king.pos-2].colour===!colour) {
        return true
      }
    }

    //next check for rook checks
    var rook = null;
    for (let i = 0; i<this.pieces.length; i++) {
      if (this.pieces[i].colour===!colour && this.pieces[i].type==="rook") {
        rook = this.pieces[i];
        break;
      }
    }

    if (rook!==null) {
      for (let i = 1; i<Math.abs(rook.pos-king.pos);i++) {
        if (this.pieces[(rook.pos>king.pos)?king.pos+i:king.pos-i]!=="" && this.pieces[(rook.pos>king.pos)?king.pos+i:king.pos-i]!==rook) {
          return false;
        }
      } 
      return true;
    }


    return false;
  }
}


var game = new Game();

class Square extends React.Component {


  constructor(props) {
    super(props);
    this.state = {
      pos: this.props.pos,
      contents: this.props.contents,
      selected: false,
      colour: this.props.pos % 2
    }

    window.addEventListener("click", () => {
      this.update();
    });

    this.movedEvent = new Event('moved');
    window.addEventListener('moved', (e) => { 
      this.deselect();
    }, false);
  }

  render() {
    return (
      <button className="square" data-pos={this.state.pos} data-selected={this.state.selected} data-colour={this.state.colour} onClick={() => this.handleClick()}>
        <img src={this.state.contents.img} alt={this.state.contents.type}/>
      </button>
    );
  }

  handleClick() {
    if (game.selectedSquare!==null && this.isValidMove(this.state.pos)) {
      game.movePiece(game.selectedSquare, this.state.pos);
      game.toggleTurn();
      window.dispatchEvent(this.movedEvent); //deselect all squares
      return;
    }

    if (this.state.selected===false && game.selectedPiece===null && this.state.contents!=="") {
      if (game.pieces[this.state.pos].colour===game.turn) {
        this.select();
      }
    } else if (this.state.selected===true) {
      this.deselect();
    }
  }

  deselect() {
    this.setState({selected:false});
    game.selectPiece("");
  }
  select() {
    this.setState({selected:true});
    game.selectPiece(game.pieces[this.state.pos]);
  }

  update() {
    this.setState({contents:game.pieces[this.state.pos]});
  }

  isValidMove(newPos) {
    console.log(newPos + " from "+game.selectedSquare);
    if (newPos===game.selectedSquare || game.pieces[newPos].colour===game.selectedPiece.colour) {
      return false;
    }

    if (game.pieces[game.selectedSquare].type==="rook") { //rook
      if (newPos<game.selectedSquare) {  //right to left
        for (let i=1;i<game.selectedSquare-newPos;i++) {
          if (game.pieces[game.selectedSquare-i]!=="") {
            return false;
          }
        }
      } else {
        for (let i=1;i<newPos-game.selectedSquare;i++) {
          if (game.pieces[game.selectedSquare+i]!=="") {
            return false;
          }
        }
      }
    } else if (game.pieces[game.selectedSquare].type==="knight") { //knight
      if (Math.abs(newPos-game.selectedSquare)!==2 || game.pieces[newPos].colour===game.selectedPiece.colour) {
        return false;
      }
    } else {  //king
      if (Math.abs(newPos-game.selectedSquare)!==1 || game.pieces[newPos].colour===game.selectedPiece.colour) {
        return false;
      }
    }
    return true; //no checks
  }
}

class Board extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      turn:game.turn,
      checks:game.inCheck
    }

    window.addEventListener("click", () => {
      if (this.state.turn !== game.turn) {
        this.setState({turn:!this.state.turn}); //toggle turn
      }

      //show checks
      if (game.inCheck!==this.state.checks) {
        this.setState({ checks:game.inCheck });
      }
    });
  }

  renderSquare(pos) {
      return <Square contents={game.pieces[pos]} pos={pos}/>
  }
  renderInfo() {
    if (this.state.checks!==null) {
      return <h4>{(this.state.turn ? "black":"white") + " to move | " + (this.state.checks ? "black":"white") + " in check"}</h4>
    } else {
      return <h4>{(this.state.turn ? "black":"white")+" to move"}</h4>
    }
  }

  //{this.state.turn ? "black to move":"white to move"}

  render() {
    return(
      <div>
        <h1>chess :)</h1>
        {this.renderInfo()}
        {this.renderSquare(0)}
        {this.renderSquare(1)}
        {this.renderSquare(2)}
        {this.renderSquare(3)}
        {this.renderSquare(4)}
        {this.renderSquare(5)}
        {this.renderSquare(6)}
        {this.renderSquare(7)}

      </div>
    );
  }
}

function App() {
  return (
    <div className="App">
      <Board/>
    </div>
  );
}

export default App;