import React, { useState } from 'react'
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import { Button, Card, Modal, Dropdown, Spinner, ButtonGroup } from 'react-bootstrap'
import { BiUpArrowCircle } from 'react-icons/bi'
import './home.css'
import { useSwipeable } from 'react-swipeable';

const Profile = (props) => {
    const [moviesshowresult, setMoviesshowresult] = useState(3)
    const [seriesshowresult, setSeriesshowresult] = useState(3)
    const [seriesormovies, setSeriesormovies] = useState(localStorage.getItem('mos') === null ? 0 : Number(localStorage.getItem('mos')))
    const [dark, setDark] = useState(localStorage.getItem('doc') === null ? 0 : Number(localStorage.getItem('doc')))
    const [request, setRequest] = useState(0)
    const [viewby, setViewby] = useState(false)
    const [bttview, setBttview] = useState(false)
    const [sortgenre, setSortgenre] = useState(false)
    const [usermodal, setUsermodal] = useState(false)
    const [genremode, setGenremode] = useState(false)
    const [tempgenre, setTempgenre] = useState('')
    window.onpopstate = function(event) {if(event){
        setUsermodal(false)
        setSortgenre(false)
    }}
    localStorage.setItem('mos', seriesormovies)
    localStorage.setItem('doc', dark)
    //console.log(props.profiledata.movies, "ffff")
    var userid = props.profiledata.username
    const Homeshow = async (filter) => {
        var moviesshows = props.profiledata.movies
        var seriesshows = props.profiledata.series
        var revealed = []
            for (var moviesshow of moviesshows){
                var splitted = (moviesshow).split('::')
                const res = await fetch(`https://api.themoviedb.org/3/movie/${splitted[0]}?api_key=${process.env.REACT_APP_TMDB_API_KEY}&language=en-US`)
                const data = await res.clone().json()
                if(!data.errors){revealed.push(data.poster_path+'::'+data.title+'::'+(data.release_date === '' ? 'No date!' : (data.release_date).slice(0, 4) )+'::'+splitted[1]+'::'+splitted[2]+'::'+splitted[3]+'::'+splitted[0])} //Adding splitted[0] (id) coz it needed when we update movie/series stuffs.
            }
        if(filter === '0'){setMoviesshowresult(revealed.reverse())}
        else{setMoviesshowresult(revealed)}

        revealed = []
            for (var seriesshow of seriesshows){ 
                splitted = (seriesshow).split('::')
                const res = await fetch(`https://api.themoviedb.org/3/tv/${splitted[0]}?api_key=${process.env.REACT_APP_TMDB_API_KEY}&language=en-US`)
                const data = await res.clone().json()
                if(!data.errors){revealed.push(data.poster_path+'::'+data.name+'::'+(data.first_air_date === ('' || null) ? 'No date!' : (data.first_air_date).slice(0, 4) )+'::'+splitted[1]+'::'+splitted[2]+'::'+splitted[3]+'::'+splitted[0])}
                }
        if(filter === '0'){setSeriesshowresult(revealed.reverse())}
        else{setSeriesshowresult(revealed)}
        
    }
    window.onscroll = function(){scrollf()}
    const scrollf = () => {
        if(document.body.scrollTop > 500 || document.documentElement.scrollTop > 500){
            setBttview(true)
        } else {
            setBttview(false)
        }
    }
    const AtoZ = async (filter) => {
        let names = []
        let sortednames = []
        let s_names = []
        for(let az of moviesshowresult){
            let splitname = az.split('::')
            names.push(splitname[1])
        }
        names.sort()
        for(let azz of names){
            for(let azzz of moviesshowresult){
                let splitname = azzz.split('::')
                if(azz === splitname[1]){
                    sortednames.push(azzz)
                }
            }
        }
        names = []
        for(let az of seriesshowresult){
            let splitname = az.split('::')
            names.push(splitname[1])
        }
        names.sort()
        for(let azz of names){
            for(let azzz of seriesshowresult){
                let splitname = azzz.split('::')
                if(azz === splitname[1]){
                    s_names.push(azzz)
                }
            }
        }
        if(filter === '0'){setMoviesshowresult(sortednames); setSeriesshowresult(s_names)}
        else{setMoviesshowresult(sortednames.reverse()); setSeriesshowresult(s_names.reverse())}
    }
    const Raterange = async (filter) => {
        let names = []
        let sortednames = []
        let s_names = []
        for(let az of moviesshowresult){
            let splitname = az.split('::')
            names.push(splitname[3])
        }
        names.sort((a, b) => a - b)
        for(let azz of names){
            for(let azzz of moviesshowresult){
                let splitname = azzz.split('::')
                if(azz === splitname[3]){
                    moviesshowresult.splice(moviesshowresult.indexOf(azzz), 1)
                    sortednames.push(azzz)
                }
            }
        }
        names = []
        for(let az of seriesshowresult){
            let splitname = az.split('::')
            names.push(splitname[3])
        }
        names.sort((a, b) => a - b)
        for(let azz of names){
            for(let azzz of seriesshowresult){
                let splitname = azzz.split('::')
                if(azz === splitname[3]){
                    seriesshowresult.splice(seriesshowresult.indexOf(azzz), 1)
                    s_names.push(azzz)
                }
            }
        }
        if(filter === '0'){setMoviesshowresult(sortednames); setSeriesshowresult(s_names)}
        else{setMoviesshowresult(sortednames.reverse()); setSeriesshowresult(s_names.reverse())}
    }
    const handlers = useSwipeable({
        onSwipedLeft: () => {seriesormovies === 0 ? setSeriesormovies(1) : setSeriesormovies(0)},
        onSwipedRight: () => {seriesormovies === 0 ? setSeriesormovies(1) : setSeriesormovies(0)}
    })
    if(request == 0){
        Homeshow('0')
        setRequest(1)
    }
    if(dark === 1){document.body.style.backgroundColor = "#171717"}
    else{document.body.style.backgroundColor = "white"}
    var final = []
    var badgestyle = {borderColor: (dark === 0 ? '' : '#2c2c30'), marginBottom: '8px', borderRadius: '50px', color: 'gray', fontWeight: '700', backgroundColor: (dark === 0 ? 'rgba(52, 52, 52, 0.2' : 'rgba(55, 55, 55, 1')}
    var showresult
    var countofshowresult = 0
    if(seriesormovies === 0){showresult = moviesshowresult}
    else{showresult = seriesshowresult}
    return (
        <div div style={{maxWidth: '1130px', margin: '0 auto'}}>
        <div className='topfield'>
        <h4 style={{cursor: 'default', marginTop: '5px', marginBottom: '5px', color: (dark === 0 ? 'green' : 'limegreen'), width:'100%'}}>Bingers Play</h4>
            <Button onClick={() => {window.location.assign('#hithere'); setUsermodal(true)}} style={{paddingTop: '0px'}} variant="none"><img alt='menu' style={{width: '24px', height: '24px'}} src={dark === 0 ? "https://img.icons8.com/material-rounded/96/000000/user.png" : "https://img.icons8.com/material-rounded/96/ffffff/user.png" } type='button'/></Button>
            <Modal onHide={() => {setUsermodal(false); window.history.go(-1)}} contentClassName='popup' show={usermodal} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Body style={{backgroundColor: (dark === 0 ? '' : '#2c2c30'), borderRadius: '25px'}}>
                        <div style={{color: (dark === 0 ? '' : '#EDEDED'), display: 'flex', paddingTop: '15px'}}>
                            <div>
                            <img type='button' style={{cursor: 'default', height: '48px', weight:'48px', borderRadius: '50px'}} alt='menu' src={dark === 0 ? "https://img.icons8.com/material-rounded/96/000000/user.png" : "https://img.icons8.com/material-rounded/96/ffffff/user.png" } />
                            </div>
                            <div style={{paddingLeft: '10px', width: '82%', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly'}}>
                            <h5 style={{cursor: 'default', fontWeight: '700', textOverflow: 'ellipsis', overflow: 'hidden', paddingTop: '3px'}}>{userid}</h5>
                            </div>
                            </div>
                            <div style={{paddingTop: '20px', paddingBottom: '20px'}}>
                            </div>
                            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                            <Button style={{width: '100%', marginBottom: '15px', backgroundColor: (dark === 0 ? '' : 'limegreen'), color: (dark === 0 ? '' : '#2c2c30')}} onClick={() => window.location.href = "https://bingers-play.web.app/"} variant='success'>Your account</Button>
                            </div>
                        </Modal.Body>
                        </Modal>
        </div>
        <div style={{marginTop: '-1%', paddingLeft: '10px', display: 'flex', justifyContent:'space-between'}}>
        <h1 style={{cursor: 'default', paddingLeft: '4px', fontWeight: '700', color: (dark === 0 ? 'gray' : '#EDEDED')}}>{seriesormovies === 0 ? 'Movies' : 'Series'} <Button variant='light' style={{cursor: 'default', height: '22px',paddingTop: '0px', marginBottom: '3px', paddingLeft: '4px', paddingRight: '4px', fontSize: '15px', fontWeight: '700', borderRadius: '50px', color: (dark === 0 ? 'white' : 'black'), backgroundColor: (dark === 0 ? 'black' : '#EDEDED')}}>{seriesormovies === 0 ? <>{moviesshowresult === 3 ? 0 : moviesshowresult.length}</> : <>{seriesshowresult === 3 ? 0 : seriesshowresult.length}</>}</Button></h1>
        <Dropdown as={ButtonGroup} className='equalize'>
                <Dropdown.Toggle variant={dark === 0 ? 'none' : 'dark'} menuAlign="right">
                    <Dropdown.Menu style={{backgroundColor: (dark === 0 ? '' : '#2c2c30')}}>
                    <Dropdown.Header style={{color: (dark === 0 ? '' : 'gray')}} >Switch to</Dropdown.Header>
                    <Dropdown.Item style={{color: (dark === 0 ? '' : '#EDEDED')}} onClick={()=> {seriesormovies === 0 ? setSeriesormovies(1) : setSeriesormovies(0)}}>{seriesormovies === 0 ? 'Series' : 'Movies'}</Dropdown.Item>
                    <Dropdown.Divider style={{backgroundColor: (dark === 0 ? '' : '#EDEDED'), marginLeft: '25%', width: '50%'}}/>
                    <Dropdown.Header style={{color: (dark === 0 ? '' : 'gray')}}>View by</Dropdown.Header>
                    <Dropdown.Item style={{color: (dark === 0 ? '' : '#EDEDED')}} onClick={()=> {viewby ? setViewby(false) : setViewby(true)}}>{viewby ? 'Sherlock view' : 'Groot view'}</Dropdown.Item>
                    <Dropdown.Divider style={{backgroundColor: (dark === 0 ? '' : '#EDEDED'), marginLeft: '25%', width: '50%'}}/>
                    <Dropdown.Header style={{color: (dark === 0 ? '' : 'gray')}}>Mode</Dropdown.Header>
                    <Dropdown.Item style={{color: (dark === 0 ? '' : '#EDEDED')}} onClick={()=> {dark === 0 ? setDark(1) : setDark(0)}}>{dark === 0 ? 'Batman mode' : 'Classic mode'}</Dropdown.Item>
                    <Dropdown.Divider style={{backgroundColor: (dark === 0 ? '' : '#EDEDED'), marginLeft: '25%', width: '50%'}}/>
                    <Dropdown.Header style={{color: (dark === 0 ? '' : 'gray')}}>Sort by</Dropdown.Header>
                    <Dropdown.Item style={{color: (dark === 0 ? '' : '#EDEDED')}} onClick={()=> {Homeshow('0'); setGenremode(false)}}>Date (Newest)</Dropdown.Item>
                    <Dropdown.Item style={{color: (dark === 0 ? '' : '#EDEDED')}} onClick={()=> {Homeshow('1'); setGenremode(false)}}>Date (Oldest)</Dropdown.Item>
                    <Dropdown.Item style={{color: (dark === 0 ? '' : '#EDEDED')}} onClick={()=> {AtoZ('0'); setGenremode(false)}}>A-Z</Dropdown.Item>
                    <Dropdown.Item style={{color: (dark === 0 ? '' : '#EDEDED')}} onClick={()=> {AtoZ('1'); setGenremode(false)}}>Z-A</Dropdown.Item>
                    <Dropdown.Item style={{color: (dark === 0 ? '' : '#EDEDED')}} onClick={()=> {Raterange('1'); setGenremode(false)}}>Rating (10-0)</Dropdown.Item>
                    <Dropdown.Item style={{color: (dark === 0 ? '' : '#EDEDED')}} onClick={()=> {Raterange('0'); setGenremode(false)}}>Rating (0-10)</Dropdown.Item>
                    <Dropdown.Item style={{color: (dark === 0 ? '' : '#EDEDED')}} onClick={()=> {window.location.assign('#hithere'); setSortgenre(true)}}>Genre</Dropdown.Item>
                    &nbsp;
                    </Dropdown.Menu>
                </Dropdown.Toggle>
            </Dropdown>
        </div>
        <Modal size="lg" aria-labelledby="contained-modal-title-vcenter" centered contentClassName='popup' show={sortgenre} onHide={() => {setSortgenre(false); window.history.go(-1)}}>
        <Modal.Body style={{backgroundColor: (dark === 0 ? '' : '#2c2c30'), borderRadius: '25px'}}>
                <h1 style={{color: (dark === 0 ? 'gray' : '#EDEDED'), paddingBottom: '15px', marginLeft: '5px'}}><strong>Sort genre by</strong></h1>
                    <Button className='genrebtn' onClick={() => {setTempgenre('Action'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light' active>Action</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Adventure'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Adventure</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Comedy'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Comedy</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Crime'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Crime</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Drama'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Drama</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Fantasy'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Fantasy</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Feel good'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Feel good</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Horror'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Horror</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Love'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Love</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Mystery'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Mystery</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Romance'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Romance</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Sci-fi'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Sci-fi</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Thriller'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Thriller</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Weird'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Weird</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Boring'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Boring</Button>{' '}
                    <Button className='genrebtn' onClick={() => {setTempgenre('Flag'); setGenremode(true); setSortgenre(false); window.history.go(-1)}} style={badgestyle} variant='light'>Flag</Button>
                </Modal.Body>
            </Modal>
        {(showresult.length > 0) ? (
        <div style={{minHeight: '87vh'}} {...handlers}>
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center'}}>
            {showresult.map((e) => (final = e.split('::'), <>{genremode ? ((tempgenre === final[4] || tempgenre ===  final[5]) && (countofshowresult = 1)) : countofshowresult = 1}</>, 
            <div>{viewby ? <>
                <Card className={dark === 0 ? 'hulkcardstyleprofile' : 'hulkcardstyleprofiledark'} style={{display: (genremode && ((tempgenre === final[4] || tempgenre ===  final[5]) ? '' : 'none'))}}>
                    <Card.Title className='titletext'>{final[1]}</Card.Title>
                </Card>
                </> : <>
            <Card className={dark === 0 ? 'sherlockcardstyleprofile' : 'sherlockcardstyleprofiledark'} style={{display: (genremode && ((tempgenre === final[4] || tempgenre ===  final[5]) ? '' : 'none'))}}>
                <Card.Img style={{borderRadius: '20px', width: '25%', height: 'auto'}} alt='Poster' src={final[0] === 'null' ? 'https://allmovies.tube/assets/img/no-poster.png' : "https://image.tmdb.org/t/p/w500"+final[0]} />
                <Card.Body style={{padding: '0px', paddingLeft: '2%'}}>
                    <div style={{height: '45%',  paddingLeft: '2.5%'}}>
                    <Card.Title className='titletext'>{final[1]}</Card.Title>
                    <Card.Text style={{color: 'gray', marginTop: '-4%'}}>{final[2]}</Card.Text>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly'}}>
                    <div style={{display: 'flex', flexDirection: 'column', width:'50%', justifyContent: 'space-evenly'}}>
                    {final[4] === 'one' && <Button style={{cursor: 'default', marginBottom: '3%', paddingTop: '0%', paddingBottom: '0%', borderRadius: '50px', fontWeight: '500', color: 'orange', backgroundColor: 'rgba(254, 216, 177, 0.2)', border: 'none'}} variant='light'>{final[5]}</Button>}
                    {final[5] === 'one' && <Button style={{cursor: 'default', marginBottom: '3%', paddingTop: '0%', paddingBottom: '0%', borderRadius: '50px', fontWeight: '500', color: 'orange', backgroundColor: 'rgba(254, 216, 177, 0.2)', border: 'none'}} variant='light'>{final[4]}</Button>}
                    {final[4] === final[5] && <Button style={{cursor: 'default', marginBottom: '3%', paddingTop: '0%', paddingBottom: '0%', borderRadius: '50px', fontWeight: '500', color: 'orange', backgroundColor: 'rgba(254, 216, 177, 0.2)', border: 'none'}} variant='light'>{final[4]}</Button>}
                    {(((final[4] || final[5]) !== 'one')&&(final[4] !== final[5])) && <>
                        <Button style={{cursor: 'default', marginBottom: '3%', paddingTop: '0%', paddingBottom: '0%', borderRadius: '50px', fontWeight: '500', color: 'orange', backgroundColor: 'rgba(254, 216, 177, 0.2)', border: 'none'}} variant='light'>{final[4]}</Button>
                        <Button style={{cursor: 'default', marginBottom: '3%', paddingTop: '0%', paddingBottom: '0%', borderRadius: '50px', fontWeight: '500', color: 'orange', backgroundColor: 'rgba(254, 216, 177, 0.2)', border: 'none'}} variant='light'>{final[5]}</Button>
                    </>}
                    </div>
                    <div class="cirshow">
                            <div class="innershow" style={{background: (dark === 0 ? 'white' : '#2c2c30')}}></div>
                            <div class="numbershow">{final[3]}</div>
                            <div class="circleshow">
                            {final[3] == 0.5 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 0%, 50% 46%, 66% 0)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 1 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 0%, 50% 46%, 85% 0)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 1.5 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 0%, 50% 46%, 100% 0)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 2 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 0%, 50% 46%, 175% 0)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 2.5 && (
                                            <div class="barshow" style={{clipPath: 'inset(0 0 50% 50%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 3 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 0%, 100% 0%, 100% 65%, 50% 50%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 3.5 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 0%, 100% 0%, 100% 85%, 50% 50%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 4 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 0%, 100% 0%, 100% 110%, 50% 50%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 4.5 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 0%, 100% 0%, 100% 190%, 50% 50%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 5 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 5.5 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 35% 100%, 50% 50%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 6 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 10% 100%, 50% 50%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 6.5 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 0, 100% 0, 100% 100%, -20% 100%, 50% 50%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 7 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 0, 100% 0, 100% 100%, -90% 100%, 50% 50%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 7.5 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 0, 100% 0, 100% 100%, -5000% 100%, 50% 50%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 8 && (
                                            <div class="barshow" style={{clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 50%, 0 35%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 8.5 && (
                                            <div class="barshow leftshow" style={{clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 50%, 0 10%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 9 && (
                                            <div class="barshow leftshow" style={{clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 50%, 0 -20%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 9.5 && (
                                            <div class="barshow leftshow" style={{clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 50%, 0 -50%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                                        {final[3] == 10 && (
                                            <div class="barshow leftshow" style={{clipPath: 'polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 50%, 0 -50000%)'}}>
                                                <div class="progressshow"></div>
                                            </div>)}
                            </div>
                        </div>
                    </div>
                </Card.Body>
            </Card></>}</div>))}
            {countofshowresult === 0 && <h5 style={{color: (dark === 0 ? 'gray' : '#EDEDED'), fontWeight: '600',  paddingTop: '50px', width: '80%', textAlign: "center"}}>Nothing matched with sort by genre!</h5>}
        </div></div>) : (<div style={{display: 'flex', flexDirection: 'column', height: '87vh'}} {...handlers}>
            {showresult !== 3 ? <>
        <h5 style={{color: (dark === 0 ? 'gray' : '#EDEDED'), paddingTop: '30%', marginLeft: '10%',  width: '80%', textAlign: "center"}}>Nothing uploaded here!</h5></>
        : <div style={{textAlign: 'center', marginTop: '250px'}}><Spinner animation='grow' variant='success' /></div>}
        </div>)}<BiUpArrowCircle className='btt' onClick={() => {window.scrollTo({top: 0})}} size={38} style={{color: (dark === 0 ? '' : '#EDEDED'), cursor: 'pointer', right: '0px', marginRight: '10px', position:'fixed', zIndex: '1000', bottom: '10px', display: (bttview ? 'block' : 'none')}}/><br/>
        </div>
    )
}
export default Profile;
