package salvo.salvo;

import javafx.stage.Screen;

import javax.persistence.*;
import java.util.Date;

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

    private long score;

    private Date date;

    public Score (Game game, Player player, long score, Date date){
        this.game = game;
        this.player = player;
        this.score = score;
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

    public long getScore() {
        return this.score;
    }

    public void setScore(long score) {
        this.score = score;
    }

    public Date getDate(){
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }
}
