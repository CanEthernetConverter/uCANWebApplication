exports.getSLCANSpeed = function (speedValue)
{
  switch(speedValue) {
    case 1000000:
        return '8'
        break;
    case 800000:
        return '7'
        break;
    case 500000:
        return '6'
        break;
    case 250000:
        return '5'
        break;
    case 125000:
        return '4'
        break;
    case 100000:
        return '3'
        break;
    default:
        return '8';
    }
	return '8';
}