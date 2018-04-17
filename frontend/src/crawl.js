import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

export class UserForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        depthvalue: '',
        url: '',
        crawlingStatus: null,
        link_url: [],
        image_urls: [],
        taskID: null,
        uniqueID: null
    };
    this.statusInterval = 1
    this.handleURLChange = this.handleURLChange.bind(this);
    this.handleDepthChange = this.handleDepthChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.checkCrawlStatus = this.checkCrawlStatus.bind(this);
  }

  handleURLChange(event) {
    this.setState({url: event.target.value});
  }

  handleDepthChange(event){
    this.setState({depthvalue: event.target.value});
  }

  handleSubmit(event) {
    var self = this;
    event.preventDefault();

    if (!this.state.url) return false;

    // send a post request to client when form button clicked
    // django response back with task_id and unique_id.
    // We have created them in views.py file, remember?
    var qs = require('qs');
    axios.post('crawl/api/', qs.stringify({ url: this.state.url }))
    .then(function(resp){
        if (resp.data.error) {
            alert(resp.data.error)
            return
        }
        // Update the state with new task and unique id
        self.setState({
            taskID: resp.data.task_id,
            uniqueID: resp.data.unique_id,
            crawlingStatus: resp.status
        }, () => {
            // ####################### HERE ########################
            // After updating state,
            // i start to execute checkCrawlStatus method for every 2 seconds
            // Check method's body for more details
            // ####################### HERE ########################
            self.statusInterval = setInterval(self.checkCrawlStatus, 2000)
        });
    });
}
  componentWillUnmount() {
      // i create this.statusInterval inside constructor method
      // So clear it anyway on page reloads or
//      React.render('Searching {this.state.url}' ,document.getElementById('results'));
      clearInterval(this.statusInterval)
  }

  checkCrawlStatus = () => {
      // this method do only one thing.
      // Making a request to server to ask status of crawling job
      var self = this,
      params = {task_id: this.state.taskID, unique_id: this.state.uniqueID };

      axios.get('crawl/api/',{params : params})
          .then(function(resp){
              var data = resp.data;
              if (data.image_urls && data.link_url) {
                  // If response contains a data array
                  // That means crawling completed and we have results here
                  // No need to make more requests.
                  // Just clear interval
                  clearInterval(self.statusInterval)
                  self.setState({
                      link_url: data.link_url,
                      image_urls: data.image_urls
                  })
              } else if (resp.data.error) {
                  // If there is an error
                  // also no need to keep requesting
                  // just show it to user
                  // and clear interval
                  clearInterval(self.statusInterval)
                  alert(resp.data.error)
              } else if (resp.status) {
                  // but response contains a `status` key and no data or error
                  // that means crawling process is still active and running (or pending)
                  // don't clear the interval.
                  self.setState({
                      crawlingStatus: resp.status
                  });
              }
      });
  }

  render() {
    return (
      <div>
          <form onSubmit={this.handleSubmit}>
            <label>
              URL: <input type="text" value={this.state.url} onChange={this.handleURLChange} />
              Depth: <input type="number" value={this.state.depthvalue} onChange={this.handleDepthChange} />
            </label>
            <input type="submit" value="Submit" />
          </form>

          <div id='crawl_results'>
               <div>
              {this.state.link_url.map(item => (
                    <span><a href={item} key={item.id}>{item}</a></span>
                ))}
               </div>
              {this.state.image_urls.map(images => (
                    images.map(eachImage => (
                        <span><img style={{width: '50px', height: '50px'}} key={eachImage.id} src={eachImage} alt={eachImage}/></span>
                    ))
                ))}
          </div>
      </div>
    );
  }
}