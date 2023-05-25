
exports.Hollow2 = (data) => {
  return data != null && data !== '' && !(isNaN(data) && typeof data === 'number')
}
  
exports.Today = () =>{
  var d = new Date();
  var today = d.getFullYear()+"-";
  today += (d.getMonth() + 1)+"-";
  today += d.getDate()+" ";
  today += d.getHours()+":"+d.getMinutes();
  return today
}