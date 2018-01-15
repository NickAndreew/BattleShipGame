package salvo.salvo;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;
import java.util.*;
import java.util.stream.Collectors;

import static java.util.stream.Collectors.toList;

@Entity
public class Player {

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private long id;
    private String email;

    @OneToMany(mappedBy="player", fetch = FetchType.EAGER)
    private Set<GamePlay> gamePlays = new HashSet<>();

    @OneToMany(mappedBy="player", fetch = FetchType.EAGER)
    private Set<Score> scores = new HashSet<>();

    private String password;

    public Player() {

    }

    public Player(String email, String password){
        super();
        this.email = email;
        this.password = password;
    }

    public Long getId(){
        return this.id;
    }

    public Player(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void addGamePlay (GamePlay gamePlay){
        gamePlays.add(gamePlay);
    }

    public Set<GamePlay> getGamePlays(){
        return this.gamePlays;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public List<Score> getScoreFromGame (Game game){
        List<Score> scoresList = game.getScore()
                .stream()
                .collect(toList());
        return scoresList;
    }

    public int scoresTotal(){
        List<Score> allScores = scores.stream().collect(toList());
        int total = 0;
        for(int i = 0; i<=allScores.size()-1 ;i++){
            total++;
        }
        return total;
    }

    public int totalNumberOfWins(){
        List<Score> allScores = scores.stream().collect(toList());
        int winsCount = 0;
        for(int i = 0; i<=allScores.size()-1 ;i++){
            if(allScores.get(i).getScore()==1){
                winsCount++;
            }
        }
        return winsCount;
    }

    public int totalNumberOfLoses(){
        List<Score> allScores = scores.stream().collect(toList());
        int lostCount = 0;
        for(int i = 0; i<=allScores.size()-1 ;i++){
            if(allScores.get(i).getScore()==0){
                lostCount++;
            }
        }
        return lostCount;
    }

    public int totalNumberOfTies(){
        List<Score> allScores = scores.stream().collect(toList());
        int tieCount = 0;
        for(int i = 0; i<=allScores.size()-1 ;i++){
            if(allScores.get(i).getScore()==0.5){
                tieCount++;
            }
        }
        return tieCount;
    }

}
