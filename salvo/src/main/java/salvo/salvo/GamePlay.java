package salvo.salvo;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.text.SimpleDateFormat;
import java.util.*;
import javax.persistence.*;

import static java.util.stream.Collectors.toList;

@Entity
public class GamePlay {

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="player_id")
    private Player player;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="game_id")
    private Game game;

    @OneToMany(mappedBy="gamePlay", fetch = FetchType.EAGER)
    private Set<Ship> ships;

    @OneToMany(mappedBy="gamePlay", fetch = FetchType.EAGER)
    private Set<Salvo> salvos;

    @OneToOne(mappedBy="gamePlay", fetch = FetchType.EAGER)
    private Score score;

    private String date;

    private boolean type;

    public GamePlay(){}

    public GamePlay(Player player, Game game){
        this.game = game;
        this.player = player;
        if(game.getGamePlays().size()<1){
            game.addGamePlay(this);
        }
        player.addGamePlay(this);
        Date newDate = new Date();
        SimpleDateFormat sdf = new SimpleDateFormat("YYYY-MM-DD HH:MM:SS");
        this.date = sdf.format(newDate);
    }


    public long getId() {
        return id;
    }

    public Player getPlayer() {
        return player;
    }

    public Game getGame() {
        return this.game;
    }

    public String getDate() {
        return this.date;
    }

    public void setPlayer(Player player){
        this.player = player;
    }

    public void setGame(Game game){
        this.game = game;
    }

    public Set<Ship> getShips() {
        return this.ships;
    }

    public void setShips(Set<Ship> ships) {
        this.ships = ships;
    }

    public Set<Salvo> getSalvos() {
        return this.salvos;
    }

    public boolean getType() {
        return type;
    }

    public void setType(boolean type) {
        this.type = type;
    }

    public void addShip(Ship ship){
        ship.setGamePlay(this);
        this.ships.add(ship);
    }

    public void addSalvo(Salvo salvo){
        salvo.setGamePlay(this);
        this.salvos.add(salvo);
    }

    public void setScore(Score score) {
        this.score = score;
    }

    public Score getScore(){
        return this.score;
    }

    @JsonIgnore
    public Player getEnemy(){
        Player player = null;
        List<Player> playerList = this.getGame().getGamePlays()
                .stream()
                .map(gamePlay -> (gamePlay.getPlayer()))
                .collect(toList());
        for(int i=0;i<=playerList.size()-1;i++){
            if(playerList.get(i).getId() != this.getPlayer().getId()){
                player = playerList.get(i);
            }
        }
        return player;
    }

    @JsonIgnore
    public GamePlay getEnemyGamePlay(){
        GamePlay gamePlay = null;
        List<GamePlay> gamePlayList = this.getGame().getGamePlays()
                .stream()
                .collect(toList());
        for(int i=0;i<=gamePlayList.size()-1;i++){
            if(gamePlayList.get(i).getId()!=this.getId()){
                gamePlay = gamePlayList.get(i);
            }
        }
        return gamePlay;
    }

    public Integer getLastTurn(){
        if(!this.getSalvos().isEmpty()){
            return this.getSalvos().stream()
                    .map(s -> s.getTurn())
                    .max((x,y) -> Integer.compare(x,y))
                    .get();
        } else {
            return 0;
        }
    }

}
