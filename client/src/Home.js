import React from 'react'
import { Header, Image, Button } from 'semantic-ui-react'
import axios from 'axios'
import { StaggeredMotion, Motion, spring, presets } from 'react-motion'
import styled from 'styled-components'
import Dropped from './Dropped'

const Div = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  background: #EEE;
`

class Home extends React.Component {
  state = { x: 0, y: 0, followers: [], dropped: [] }

  componentDidMount() {
    window.addEventListener('mousemove', this.mouseMove)
    window.addEventListener('dblclick', this.dropFollower)
  }

  dropFollower = () => {
    const { dropped, x, y } = this.state
    const [drop, ...followers] = this.state.followers
    this.setState({
      followers, 
      dropped: [...dropped, { x, y, transitioned: false, ...drop }]
    }, () => console.log(this.state.dropped))
  }

  droppedFollowers = () => {
    const { dropped } = this.state
    const moveable = dropped.filter( d => !d.transitioned )
    return moveable.map( follower => {
      return ( <Dropped addFollower={this.addFollower} {...follower} key={follower.id} /> )
    })
  }

  addFollower = (id) => {
    const { dropped, followers } = this.state
    const follower = dropped.find( f => f.id === id )
    this.setState({
      followers: [...followers, follower],
      dropped: dropped.filter( d => d.id !== id )
    })
  }

  getFollowers = () => {
    axios.get('/api/followers')
      .then( res => this.setState({ followers: res.data }) )
  }

  mouseMove = ({ pageX: x, pageY: y }) => {
    this.setState({ x, y })
  }

  getStyles = (prevStyles) => {
    const endValue = prevStyles.map((_, i) => {
      return i === 0
      ? this.state
      : {
        x: spring(prevStyles[i - 1].x, presets.gentle),
        y: spring(prevStyles[i - 1].y, presets.gentle),
      }
    })

    return endValue

  }

  render() {
    const { followers } = this.state
    if (followers.length) {
      return (
        <div>
          { this.droppedFollowers() }
          { this.state.followers.length > 0 &&
            <StaggeredMotion
              defaultStyles={this.state.followers.map(() => ({x: 0, y: 0}))}
              styles={this.getStyles}>
              { avatars =>
                <div style={{ width: '100%', height: '100%', position: 'absolute', background: '#EEE'}}>
                  { avatars.map(({x,y}, i) => {
                    let follower = this.state.followers[i];
                    if (follower) {
                      return (
                        <div
                          key={i}
                          style={{
                            borderRadius: '99px',
                            backgroundColor: 'white',
                            width: '50px',
                            height: '50px',
                            border: '3px solid white',
                            position: 'absolute',
                            backgroundSize: '50px',
                            backgroundImage: `url(${this.state.followers[i].img})`,
                            WebkitTransform: `translate3d(${x - 50}px, ${y - 50}px, 0)`,
                            transform: `translate3d(${x - 50}px, ${y - 50}px, 0)`,
                            zIndex: avatars.length - i,
                          }}
                        />
                      )
                    } else {
                      return null
                    }
                  }
                  )}
                </div>
              }
            </StaggeredMotion>
          }
        </div>
      );
    } else {
      return <Button onClick={this.getFollowers}>Click</Button>
    }
  };

}

export default Home
