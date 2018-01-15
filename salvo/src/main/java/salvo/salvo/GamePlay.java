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

    @OneToOne(mappedBy="player", fetch = FetchType.EAGER)
    private Score score;

    private String date;

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
        return game;
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

    public void addShip(Ship ship){
        ship.setGamePlay(this);
        this.ships.add(ship);
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
        GamePlay gamePlay = new GamePlay();
        List<GamePlay> gamePlayList = this.getGame().getGamePlays()
                .stream()
                .collect(toList());
        for(int i=0;i<=gamePlayList.size()-1;i++){
            if(gamePlayList.get(i)!=this){
                gamePlay = gamePlayList.get(i);
            }
        }
        return gamePlay;
    }

    public Score getScore(){
        return this.score;
    }

}
