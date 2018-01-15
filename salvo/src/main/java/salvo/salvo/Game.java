package salvo.salvo;

import javax.persistence.*;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Entity
public class Game {

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private long id;
    private String date;

    @OneToMany(mappedBy="game", fetch = FetchType.EAGER)
    private Set<GamePlay> gamePlays = new HashSet<>();

    @OneToMany(mappedBy="game", fetch = FetchType.EAGER)
    private Set<Score> score = new HashSet<>();

    public Game() {
        Date newDate = new Date();
        SimpleDateFormat sdf = new SimpleDateFormat("YYYY-MM-DD HH:MM:SS");
        this.date = sdf.format(newDate);
    }

    public String getDate() {
        return this.date;
    }

    public void setDate(String newDate) {
        SimpleDateFormat sdf = new SimpleDateFormat("YYYY-MM-DD HH:MM:SS");
        this.date = sdf.format(newDate);
    }

    public Long getId(){
        return this.id;
    }

    public void addGamePlay(GamePlay gamePlay){
        if(gamePlays.size()< 1){
            gamePlays.add(gamePlay);
        } else {
            System.out.println("MORE THAN TWO GAME_PLAYS!!!");
        }
    }

    public Set<GamePlay> getGamePlays() {
        return this.gamePlays;
    }

    public Set<Player> getPlayers(){
        Set<Player> playersSet = new HashSet<>();
        this.gamePlays
                .stream()
                .map(gamePlay -> (playersSet.add(gamePlay.getPlayer())));
        return playersSet;
    }

    public Set<Score> addScore(Score score){
        Set<Score> scoreSet = this.score;
        scoreSet.add(score);
        return scoreSet;
    }

    public Set<Score> getScore() {
        return score;
    }

    public void setScore(Set<Score> score) {
        this.score = score;
    }
}
