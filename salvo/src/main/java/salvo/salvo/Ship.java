package salvo.salvo;

import javax.persistence.*;
import java.util.List;

@Entity
public class Ship {

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private long id;
    public enum Type {CARRIER(5), BATTLESHIP(4), SUBMARINE(3), DESTROYER(3), PATROL_BOAT(2);

        private int shipLength;

        Type(int shipLength){
            this.shipLength = shipLength;
        }

        public int getShipLength(){
            return this.shipLength;
        }
    };

    private Type type;

    private boolean sunk = false;

    @ElementCollection
    private List<String> location;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="gamePlay_id")
    private GamePlay gamePlay;

    public Ship (List<String> location, String type) {
        this.location = location;
        this.sunk = false;


        if (type == "CARRIER"){
            this.type = Type.CARRIER;
        } else if (type == "BATTLESHIP"){
            this.type = Type.BATTLESHIP;
        } else if (type == "SUBMARINE"){
            this.type = Type.SUBMARINE;
        } else if (type == "DESTROYER"){
            this.type = Type.DESTROYER;
        } else if (type == "PATROL_BOAT") {
            this.type = Type.PATROL_BOAT;
        }
    }

    public Ship (){

    }

    public long getId() {
        return id;
    }

    public Type getType() {
        return type;
    }

    public void setType(Type type) {
        this.type = type;
    }

    public GamePlay getGamePlay() {
        return gamePlay;
    }

    public void setGamePlay(GamePlay gamePlay) {
        this.gamePlay = gamePlay;
    }

    public List<String> getLocation() {
        return location;
    }

    public void setLocation(List<String> location) {
        this.location = location;
    }

    public boolean isSunk(){
        return this.sunk;
    }

    public boolean setSunk(){
        this.sunk = true;
        return this.sunk;
    }
}
