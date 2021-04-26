import React from 'react';
import './App.css';

import BlackKing from './pieces/black-king.png';
import BlackKnight from './pieces/black-knight.png';
import BlackRook from './pieces/black-rook.png';

import WhiteKing from './pieces/white-king.png';
import WhiteKnight from './pieces/white-knight.png';
import WhiteRook from './pieces/white-rook.png';

import Dot from './pieces/dot.png';

class Piece {
  constructor(colour, img, type) {
    this.colour=colour;
    this.img=img;
    this.type=type;
  }
}

class Game {
  constructor(){
    this.init();
  }

  init() {
    this.selectedSquare=null;
    this.validMoves=[];

    this.turn=false; //false = white .... true = black
    this.inCheck=null;

    this.gameOver =false;
    this.result="";

    this.pieces = [new Piece(false,WhiteKing, "king"),
      new Piece(false,WhiteKnight, "knight"),
      new Piece(false,WhiteRook, "rook"),
      "",
      "",
      new Piece(true,BlackRook, "rook"),
      new Piece(true,BlackKnight, "knight"),
      new Piece(true,BlackKing, "king")]
  }

  selectPiece(piece) {
    this.selectedSquare=(typeof piece === typeof "") ? null : this.pieces.indexOf(piece);
  }

  toggleTurn() {
    this.turn=!this.turn;
    this.selectedSquare=null;
  }

  movePiece(i, f) {
    let colour = this.pieces[i].colour;

    this.pieces[f]=game.pieces[i];
    this.pieces[i]="";

    if (this.isCheck(this.pieces, !colour)) { this.inCheck=!colour }
    else { this.inCheck=null }
  }

  isCheck(board, colour) {
    for (let i = 0; i<board.length; i++) {
      if (board[i].colour===colour && board[i].type==="king") {
        var king = board[i];
        var kingPos = board.indexOf(king);
        break;
      }
    }

    //first check for knight checks
    if (kingPos<=5) {
      if (board[kingPos+2].type==="knight"&&board[kingPos+2].colour===!colour) { return true; }
    }
    if (kingPos>=2) {
      if (board[kingPos-2].type==="knight"&&board[kingPos-2].colour===!colour) { return true; }
    }

    //next check for king checks
    if (kingPos<=6) {
      if (board[kingPos+1].type==="king"&&board[kingPos+1].colour===!colour) { return true; }
    }
    if (kingPos>=1) {
      if (board[kingPos-1].type==="king"&&board[kingPos-1].colour===!colour) { return true; }
    }

    //next check for rook checks
    var rook = null;
    for (let i = 0; i<board.length; i++) {
      if (board[i].colour===!colour && board[i].type==="rook") {
        rook = board[i];
        var rookPos = board.indexOf(rook);
        break;
      }
    }

    if (rook!==null) {
      for (let i = 1; i<Math.abs(rookPos-kingPos);i++) {
        if (board[(rookPos>kingPos)?kingPos+i:kingPos-i]!=="" && board[(rookPos>kingPos)?kingPos+i:kingPos-i]!==rook) {
          return false;
        }
      } 
      return true;
    }
    return false;
  }

  isStalemate() {
    game.validMoves=[];
    window.dispatchEvent(new Event("getAllValidMoves"));
    if (game.validMoves.length===0 && !game.isCheck(game.pieces, !game.turn)) {
      return true;
    }
    game.validMoves=[];
    return false;
  }
  isCheckmate() {
    game.validMoves=[];
    window.dispatchEvent(new Event("getAllValidMoves"));
    if (game.validMoves.length===0 && game.isCheck(game.pieces, !game.turn)) {
      return true;
    }
    game.validMoves=[];
    return false;
  }
}

var game = new Game();

class Square extends React.Component {

  state = {
    pos: this.props.pos,
    contents: this.props.contents,
    selected: false,
    colour: this.props.pos % 2,
    img: null,
  }

  constructor(props) {
    super(props);
    this.setState();

    window.addEventListener("click", () => {
      this.update();
    });

    window.addEventListener('deselectAll', (e) => { 
      this.deselect();
    }, false);
    window.addEventListener('getAllValidMoves', () => {
      if (game.pieces[this.state.pos]!=="") {
        if (game.pieces[this.state.pos].colour!==game.turn) {
          for (let i = 0; i<8; i++) {
            if (this.isValidMove(i, this.state.pos, !game.turn)) {
              game.validMoves.push(i);
            }
          }
        }
      } 
    });
  }

  render() {
    return (
      <button className="square" data-pos={this.props.pos} data-selected={this.state.selected} data-colour={this.state.colour} onClick={() => this.handleClick()}>
        <img src={(this.state.img!==Dot)?this.state.contents.img:this.state.img} alt={this.state.contents.type} draggable="false"/>
      </button>
    );
  }

  handleClick = () => {
    if (game.selectedSquare!==null && this.isValidMove(this.state.pos, game.selectedSquare, game.turn)) {
      game.movePiece(game.selectedSquare, this.state.pos);

      if (game.isStalemate() || game.isCheckmate()) { 
        game.gameOver=true; 
        game.result = (game.isStalemate()) ? "stalemate":"checkmate";
        window.dispatchEvent(new Event("gameOver"));
        return;
      }

      game.toggleTurn();
      window.dispatchEvent(new Event("deselectAll")); //deselect all squares
      return;
    } else if (game.selectedSquare!==null) {
      window.dispatchEvent(new Event("deselectAll"));
    }

    if (this.state.selected===false && game.selectedSquare===null && this.state.contents!=="") {
      if (game.pieces[this.state.pos].colour===game.turn) {
        this.select();

        for (let i = 0; i<8; i++) {
          if (this.isValidMove(i, game.selectedSquare, game.turn)) {
            game.validMoves.push(i);
          }
        }
      }
    } else if (this.state.selected===true) {
      this.deselect();
    }
  }

  deselect() {
    this.setState({selected:false});
    game.selectPiece("");

    if (game.validMoves!==[]) { game.validMoves=[]; } //reset valid moves array
  }
  select() {
    this.setState({selected:true});
    game.selectPiece(game.pieces[this.state.pos]);
  }

  update() {
    this.setState({contents:game.pieces[this.state.pos], img:(game.validMoves.includes(this.state.pos) && this.state.contents==="")?Dot:null});
  }

  isValidMove(newPos, oldPos, turn) {
    if (newPos===oldPos || game.pieces[newPos].colour===game.pieces[oldPos].colour) {
      return false;
    }

    if (game.pieces[oldPos].type==="rook") { //rook
      if (newPos<oldPos) {  //right to left
        for (let i=1;i<oldPos-newPos;i++) {
          if (game.pieces[oldPos-i]!=="") {
            return false;
          }
        }
      } else {
        for (let i=1;i<newPos-oldPos;i++) {
          if (game.pieces[oldPos+i]!=="") {
            return false;
          }
        }
      }
    } else if (game.pieces[oldPos].type==="knight") { //knight
      if (Math.abs(newPos-oldPos)!==2 || game.pieces[newPos].colour===game.pieces[oldPos].colour) {
        return false;
      }
    } else {  //king
      if (Math.abs(newPos-oldPos)!==1 || game.pieces[newPos].colour===game.pieces[oldPos].colour) {
        return false;
      }
    }

    //check if moving into check
    let tempBoard = [...game.pieces];
    tempBoard[newPos] = tempBoard[oldPos];
    tempBoard[oldPos] = "";
    if (game.isCheck(tempBoard, turn)) {
      return false;
    }

    return true;
  }
}

class Board extends React.Component {

  state = {
    turn:game.turn,
    warning:"",
    modalMessage:"",
  }

  constructor(props) {
    super(props);
    this.setState();

    window.addEventListener("click", () => {
      if (this.state.turn !== game.turn) {
        this.setState({turn:!this.state.turn}); //toggle turn
      }
    });
  }

  renderSquare(pos) {
      return <Square contents={game.pieces[pos]} pos={pos}/>
  }
  renderWarning() {
    return;
  }
  renderModal() {
    return (<Modal modalMessage={game.modalMessage}/>);
  }

  render() {
    return(
      <div>
        <h1>chess :)</h1>
        <h4>{(this.state.turn ? "black":"white")+" to move"}</h4>
        <div id="squares">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
          {this.renderSquare(6)}
          {this.renderSquare(7)}
        </div>
        {this.renderModal()}
        {this.renderWarning()}

      </div>
    );
  }
}

class Modal extends React.Component {
  state = {
    modalMessage:""
  }

  constructor(props) {
    super(props);
    this.setState({modalMessage:this.props.modalMessage});

    window.addEventListener("gameOver", () => {
      if (game.result==="checkmate") {
        this.setState({modalMessage: (game.turn ? "black":"white") + " wins by checkmate"})
      } else {
        this.setState({modalMessage:"the game was a draw due to stalemate"});  
      }

      document.getElementById("modal").style.display="block";
    });
  }

  render() {
    return(
      <div id="modal">
        <div id="modal-content">
          <h2 id="modal-message">{this.state.modalMessage}</h2>
          <button id="play-again-btn" onClick={() => this.playAgain()}>play again</button>
        </div>
      </div>
    );
  }

  playAgain = () => {
    game.init();
    this.setState({modalMessage:""});
    document.getElementById("modal").style.display="none";
    window.dispatchEvent(new Event("deselectAll"));
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