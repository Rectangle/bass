
/**
 * @name bass
 */


import { NoiseMaker } from 'Rectangle/drums';
import { Drumhead } from 'Rectangle/drums';
import { Bassdrum } from 'Rectangle/drums';
import { Snaredrum } from 'Rectangle/drums';
import { Tomdrum } from 'Rectangle/drums';
 
var bpm = 120;


var my_string_harmonics = [1, 0.8, 0.9, 0.8, 0, 0, 0, 0, 0.1, 0, 0.2, 0];


export function String(harmonic_amps, decay, base_amp){
  
  var w = 0;
  var v = 0;
  var f = 0;
  var t = 0;
  
  var sustain = 0;
  
  return{
    
    set_decay : function (d){
      decay = d;
    },
    
    hit : function (freq, len, vel) {
      t = 0;
      f = freq;
      v = vel*base_amp;
      sustain = len;
    },
    play : function(){
      
      if (v * f < 0.001){
        v = 0;
        return 0;
      }
      
      
      for (var i = 0; i < 4; i++){
        w += Math.pow(-1,i) * v * Math.cos(2 * Math.PI * f * (i+1) * t) * harmonic_amps[i] * (2 * Math.PI * f) / (i+1) / sampleRate;
      }
      
      while (t > sustain){
        w *= (1 - decay/sampleRate);
        v *= (1 - decay/sampleRate);
      }
      
      t += 1/sampleRate;
      
      return w;
    }
  };
}


var bass = String(my_string_harmonics, 50, 0.6);



var bassdrum = Bassdrum(55, 30, 2, 0.05, 3);

var hihat = NoiseMaker(0, 30, 0.1);

var snare = Snaredrum(220, 20, 0.2, 1);

var tom1 = Tomdrum(82.5, 10, 0.7, 1);
var tom2 = Tomdrum(110, 10, 0.5, 1);
var tom3 = Tomdrum(137.5, 10, 0.4, 1);

var snare2 = Snaredrum(440, 50, 0.05, 0.0);
var snare3 = Snaredrum(440, 50, 0.05, 0.1);

var drums = {
  play : function(){
    
    var bassdrumplay = bassdrum.play();
    var snareplay = snare.play();
    var hihatplay = hihat.play();
    
    var tom1play = tom1.play();
    var tom2play = tom2.play();
    var tom3play = tom3.play();
    
    var snare2play = snare2.play();
    var snare3play = snare3.play();
    
    return [
      bassdrumplay * 0.5 + hihatplay * 0.6 + snareplay * 0.4 + snare2play*0.5 + tom1play*0.8 + tom2play*0.5 + tom3play*0.2, 
      bassdrumplay * 0.5 + hihatplay * 0.4 + snareplay * 0.6 + snare3play*0.5 + tom1play*0.2 + tom2play*0.5 + tom3play*0.8];
  }
};


function compress(w){
  return Math.atan(w*(Math.PI/2))/(Math.PI/2);
}
function compress2(w){
  return [Math.atan(w[0]*(Math.PI/2))/(Math.PI/2), Math.atan(w[1]*(Math.PI/2))/(Math.PI/2)];
}

function at(t1,t2){return (t1 >= t2 && t1 <= t2+1/sampleRate);}

function each(b, beat, per_beat){
  return at(b%per_beat*60/bpm, beat%per_beat*60/bpm);
}

var beats = 0.0;


export function dsp(t) {
  
  beats += 1/sampleRate/60*bpm;
  var beatlen = 60/bpm;
  
  
  if (each(beats, 0, 1)) bass.hit(55, 0.5*beatlen, 1.0);
  
  
  if (each(beats,0, 0.5)) bassdrum.hit(1);
  if (each(beats,1, 2)) snare.hit(1);
  if (each(beats,0, 0.5)) hihat.hit(1);
  if (each(beats,0.25, 0.5)) hihat.hit(0.2);
  
  var drums_output
  var bass_output = bass.play();
  var output = bass_output;
  
  return output;
}
