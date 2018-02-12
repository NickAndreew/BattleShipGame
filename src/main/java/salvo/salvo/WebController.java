package salvo.salvo;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@Controller
@RequestMapping(path="/", method = RequestMethod.GET)
public class WebController {

    public String index(){
        return "redirect:/web/authentication.html";
    }

}
