package de.wbat.annotate.controller;

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONWriter;


//This is to test Travis


/**
 * Servlet implementation class WebAnnotate
 * @author Seid M.
 */
public class WebAnnotate extends HttpServlet {
	private static final long serialVersionUID = 1L;

    /**
     * Default constructor. 
     */
    public WebAnnotate() {
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

	}
	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		try {
			JSONArray jsonMarkedinfo = new JSONArray( request.getParameter("markUpInfo"));
			System.out.println(jsonMarkedinfo);
			
			JSONWriter writer = new JSONWriter(response.getWriter());
            writer.object();
            writer.key("response");
            writer.value("Annotation markup succesfully recieved from " +
            		request.getRemoteAddr());
            writer.endObject();   
            
            
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
	}


}
