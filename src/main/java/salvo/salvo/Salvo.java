package salvo.salvo;

import javax.persistence.*;
import java.util.List;
import java.util.Set;

@Entity
public class Salvo {

    @Id
    @GeneratedValue(strategy=GenerationType.AUTO)
    private long id;


    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="gamePlay_id")
    private GamePlay gamePlay;

    @ElementCollection
    private List<String> locations;

    private int turn;

    public Salvo (List<String> locations, int turn) {
        this.locations = locations;
        this.turn = turn;
    }

    public Salvo (){

    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public GamePlay getGamePlay() {
        return gamePlay;
    }

    public void setGamePlay(GamePlay gamePlayId) {
        this.gamePlay = gamePlayId;
    }

    public List<String> getLocations() {
        return locations;
    }

    public void setLocation(List<String> locations) {
        this.locations = locations;
    }

    public int getTurn() {
        return turn;
    }

    public void setTurn(int turn) {
        this.turn = turn;
    }
}
