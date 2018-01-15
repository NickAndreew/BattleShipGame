package salvo.salvo;

import org.springframework.beans.factory.annotation.Autowired;

import javax.persistence.*;
import java.util.List;
import java.util.stream.Collectors;

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

//    private GamePlayRepository gamePlayRepository;

    @ElementCollection
    private List<String> location;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="gamePlay_id")
    private GamePlay gamePlay;

    public Ship (List<String> location, String type) {
        this.location = location;

        if (type == "carrier"){
            this.type = Type.CARRIER;
        } else if (type == "battleship"){
            this.type = Type.BATTLESHIP;
        } else if (type == "submarine"){
            this.type = Type.SUBMARINE;
        } else if (type == "destroyer"){
            this.type = Type.DESTROYER;
        } else if (type == "patrol_boat") {
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

    public boolean getSubmarineType(){
        System.out.println("This is 'this' ------------------->  "+this.gamePlay.getShips());
        List<Type> types = this.gamePlay.getShips()
                .stream()
                .map(ship -> (ship.getType()))
                .collect(Collectors.toList());
        if(types.contains(Type.SUBMARINE)){
            return true;
        } else {
            return false;
        }

    }
}
