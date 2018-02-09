package salvo.salvo;

import javafx.stage.Screen;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
public class Score {

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="game_id")
    private Game game;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="player_id")
    private Player player;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="gamePlay_id")
    private GamePlay gamePlay;

    private double score;

    private Date date;

    public Score (Game game, Player player, GamePlay gamePlay){
        this.game = game;
        this.player = player;
        this.date = new Date();
        this.gamePlay = gamePlay;

    }

    public Score(){

    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public Game getGame() {
        return game;
    }

    public void setGame(Game game) {
        this.game = game;
    }

    public Player getPlayer() {
        return player;
    }

    public void setPlayer(Player player) {
        this.player = player;
    }

    public Long getGameId(){
        return this.game.getId();
    }

    public Long getPlayerId(){
        return this.player.getId();
    }

    public double getScore() {
        return this.score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public Date getDate(){
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public GamePlay getGamePlay() {
        return gamePlay;
    }

    public void setGamePlay(GamePlay gamePlay) {
        this.gamePlay = gamePlay;
    }

    public GamePlay getGamePlayFromParameters(Game game, Player player){
        GamePlay gamePlay = null;
        List<GamePlay> list = new ArrayList<>(game.getGamePlays());
        for(int i = 0 ; i <= list.size()-1 ; i++){
            if(list.get(i).getPlayer().getEmail()==player.getEmail() && list.get(i).getGame().getId()==game.getId()){
                gamePlay = list.get(i);
            }
        }
        return gamePlay;
    }
}
